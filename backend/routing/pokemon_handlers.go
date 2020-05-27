package routing

import (
    "encoding/json"
	"fmt"
    "log"
	"net/http"
    "time"

    "github.com/gorilla/websocket"
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
            Lat: user.Location.Lat,
            Lng: user.Location.Lng,
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
                Type: "spawn",
                NewSpawns: make([]spawn.Spawn, 0),
                Despawn: make([]spawn.Spawn, 0),
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

func GetPokedex(w http.ResponseWriter, r *http.Request) {
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

    writeJSON(w, user.Pokedex)
}
