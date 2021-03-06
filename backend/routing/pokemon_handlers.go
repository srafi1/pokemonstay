package routing

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
	pokeapi "github.com/mtslzr/pokeapi-go"
	"github.com/srafi1/pokemonstay/backend/db"
	"github.com/srafi1/pokemonstay/backend/spawn"
)

var upgrader = websocket.Upgrader{}

func GetSprite(w http.ResponseWriter, r *http.Request) {
	dex, ok := r.URL.Query()["dex"]
	if !ok || r.Method != "GET" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	_, ok = r.URL.Query()["silhouette"]
	if !ok {
		http.ServeFile(w, r, fmt.Sprintf("data/sprites/default/%s.png", dex[0]))
	} else {
		http.ServeFile(w, r, fmt.Sprintf("data/sprites/silhouette/%s.png", dex[0]))
	}
}

type ServerUpdate struct {
	Type      string        `json:"type"`
	Lat       float64       `json:"lat"`
	Lng       float64       `json:"lng"`
	NewSpawns []spawn.Spawn `json:"spawn"`
	Despawn   []spawn.Spawn `json:"despawn"`
}

type ClientUpdate struct {
	Type   string  `json:"type"`
	Lat    float64 `json:"lat"`
	Lng    float64 `json:"lng"`
	Dex    int     `json:"dex"`
	Caught bool    `json:"caught"`
}

func ServeWS(w http.ResponseWriter, r *http.Request) {
	// check auth
	err, claims := validAuth(w, r)
	if err != nil {
		log.Println(err)
		return
	}
	username := claims.Username

	// create connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println(err)
		return
	}
	defer conn.Close()

	user, err := db.GetUser(username)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	} else {
		// send initial location
		update := &ServerUpdate{
			Type: "init",
			Lat:  user.Location.Lat,
			Lng:  user.Location.Lng,
		}
		err = conn.WriteJSON(update)
		if err != nil {
			log.Println("Write error:", err)
		}
	}

	// pokemon that have been sent already
	sentSpawns := make([]spawn.Spawn, 0)
	encountered := spawn.GetEncounters(username)
	for k := range encountered {
		sentSpawns = append(sentSpawns, k)
	}

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		// parse coords
		var clientUpdate ClientUpdate
		err = json.Unmarshal(message, &clientUpdate)
		if err != nil {
			log.Println("Parse JSON error:", err)
			continue
		}

		if clientUpdate.Type == "location" {
			// save new coords
			coords := spawn.Coords{
				Lat: clientUpdate.Lat,
				Lng: clientUpdate.Lng,
			}
			spawn.PutUser(username, coords)
			err = db.SetLocation(username, coords)
			if err != nil {
				log.Println(err)
			}

			// get despawned pokemon
			update := &ServerUpdate{
				Type:      "spawn",
				NewSpawns: make([]spawn.Spawn, 0),
				Despawn:   make([]spawn.Spawn, 0),
			}
			now := time.Now()
			for i, val := range sentSpawns {
				if !now.After(val.Despawn) {
					update.Despawn = sentSpawns[:i]
					sentSpawns = sentSpawns[i:]
					break
				}
			}

			// get newly spawned pokemon
			currentSpawns := spawn.GetSpawns(coords)
			for _, val1 := range currentSpawns {
				sent := false
				for _, val2 := range sentSpawns {
					if val1 == val2 {
						sent = true
					}
				}
				if !sent {
					update.NewSpawns = append(update.NewSpawns, val1)
					sentSpawns = append(sentSpawns, val1)
				}
			}

			// send update
			err = conn.WriteJSON(update)
			if err != nil {
				log.Println("Write error:", err)
			}

			// clean up this user's encounter map
			spawn.CleanupEncounters(username)
		} else if clientUpdate.Type == "encounter" {
			var pokemon spawn.Spawn
			found := false
			for _, val := range sentSpawns {
				if val.Lat == clientUpdate.Lat &&
					val.Lng == clientUpdate.Lng &&
					val.Dex == clientUpdate.Dex {
					pokemon = val
					found = true
					break
				}
			}
			if found {
				spawn.AddEncounter(username, pokemon)
				err = db.AddEncounter(username, pokemon, clientUpdate.Caught)
				if err != nil {
					log.Println(err)
				}
			}
		}
	}
	spawn.RemoveUser(username)
}

func writeJSON(w http.ResponseWriter, data interface{}) {
	response, err := json.Marshal(data)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

type Pokedex [spawn.MAX_DEX]struct {
	Encountered bool   `json:"encountered"`
	Caught      bool   `json:"caught"`
	Name        string `json:"name"`
}

type DexName struct {
	Dex  int    `json:"dex"`
	Name string `json:"name"`
}

type PokedexInfo struct {
	Dex         int       `json:"dex"`
	Name        string    `json:"name"`
	Type        []string  `json:"types"`
	Description string    `json:"description"`
	Evolutions  []DexName `json:"evolutions"`
}

func evolvesInto(dex string) ([]DexName, error) {
	species, err := pokeapi.PokemonSpecies(dex)
	if err != nil {
		return nil, err
	}

	evolutionID := path.Base(species.EvolutionChain.URL)
	chain, err := pokeapi.EvolutionChain(evolutionID)
	if err != nil {
		return nil, err
	}
	evolutions := make([]DexName, 0)
	if species.Name == chain.Chain.Species.Name {
		for _, p := range chain.Chain.EvolvesTo {
			e, err := pokeapi.Pokemon(p.Species.Name)
			if err == nil {
				evolutions = append(evolutions, DexName{e.ID, e.Name})
			}
		}
	} else {
		for _, p := range chain.Chain.EvolvesTo {
			if species.Name == p.Species.Name {
				for _, p2 := range p.EvolvesTo {
					e, err := pokeapi.Pokemon(p2.Species.Name)
					if err == nil {
						evolutions = append(evolutions, DexName{e.ID, e.Name})
					}
				}
				break
			}
		}
	}
	return evolutions, nil
}

func GetPokedex(w http.ResponseWriter, r *http.Request) {
	// check for individual pokemon
	dex, ok := r.URL.Query()["dex"]
	if ok {
		speciesInfo, err0 := pokeapi.PokemonSpecies(dex[0])
		pokemonInfo, err1 := pokeapi.Pokemon(dex[0])
		evolutions, err2 := evolvesInto(dex[0])
		if err0 != nil || err1 != nil || err2 != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		types := make([]string, 1)
		types[0] = pokemonInfo.Types[0].Type.Name
		if len(pokemonInfo.Types) > 1 {
			types = append(types, pokemonInfo.Types[1].Type.Name)
		}
		var desc string
		for _, text := range speciesInfo.FlavorTextEntries {
			if text.Language.Name == "en" {
				desc = text.FlavorText
				break
			}
		}
		pokemon := &PokedexInfo{
			Dex:         speciesInfo.ID,
			Name:        speciesInfo.Name,
			Type:        types,
			Description: desc,
			Evolutions:  evolutions,
		}
		writeJSON(w, pokemon)
	} else {
		// return user's pokedex info
		// check auth
		err, claims := validAuth(w, r)
		if err != nil {
			log.Println(err)
			return
		}
		username := claims.Username

		user, err := db.GetUser(username)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		var response Pokedex
		for i, p := range user.Pokedex {
			response[i].Encountered = p.Encountered
			response[i].Caught = p.Caught
			if p.Caught {
				response[i].Name = spawn.PokemonName(i + 1)
			}
		}

		writeJSON(w, response)
	}
}

type Pokemon struct {
	db.Pokemon
	Name string `json:"name"`
}

func GetPokemon(w http.ResponseWriter, r *http.Request) {
	// check auth
	err, claims := validAuth(w, r)
	if err != nil {
		log.Println(err)
		return
	}
	username := claims.Username

	pokemon, err := db.GetPokemon(username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	response := make([]Pokemon, len(pokemon))
	for i, p := range pokemon {
		response[i].Pokemon = p
		response[i].Name = spawn.PokemonName(p.Dex)
	}

	writeJSON(w, response)
}

func Evolve(w http.ResponseWriter, r *http.Request) {
	from, ok0 := r.URL.Query()["from"]
	to, ok1 := r.URL.Query()["to"]
	if !ok0 || !ok1 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	fromDex, err0 := strconv.Atoi(from[0])
	toDex, err1 := strconv.Atoi(to[0])
	if err0 != nil || err1 != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// check auth
	err, claims := validAuth(w, r)
	if err != nil {
		log.Println(err)
		return
	}
	username := claims.Username

	pokemon, err := db.GetPokemon(username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	countFrom := 0
	for _, p := range pokemon {
		if p.Dex == fromDex {
			countFrom++
		}
	}

	if countFrom < 3 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	evolutions, err := evolvesInto(from[0])
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	canEvolve := false
	for _, e := range evolutions {
		if e.Dex == toDex {
			canEvolve = true
			break
		}
	}
	if !canEvolve {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = db.Evolve(username, fromDex, toDex)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}
