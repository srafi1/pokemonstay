package routing

import (
    "encoding/json"
	"fmt"
    "log"
	"net/http"

    "github.com/gorilla/websocket"
    "github.com/srafi1/pokemonstay/backend/spawn"
)

var upgrader = websocket.Upgrader{}

func GetSprite(w http.ResponseWriter, r *http.Request) {
	dex, ok := r.URL.Query()["dex"]
	if !ok || r.Method != "GET" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	url := fmt.Sprintf("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/%s.png", dex[0])
    http.Redirect(w, r, url, http.StatusMovedPermanently)
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

    for {
        mt, message, err := conn.ReadMessage()
        if err != nil {
            log.Println("Read error:", err)
            break
        }
        var coords spawn.Coords
        err = json.Unmarshal(message, &coords)
        if err != nil {
            log.Println("Parse JSON error:", err)
            continue
        }
        spawn.PutUser(username, coords)
        pokemonList := spawn.GetSpawns(coords)
        bytes, err := json.Marshal(pokemonList)
        if err != nil {
            log.Println("Error encoding JSON:", err)
        }
        err = conn.WriteMessage(mt, bytes)
        if err != nil {
            log.Println("Write error:", err)
        }
    }
    spawn.RemoveUser(username)
}
