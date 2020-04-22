package routing

import (
    "encoding/json"
	"fmt"
    "log"
	"net/http"
    "time"

    "github.com/gorilla/sessions"
    "github.com/gorilla/websocket"
    "github.com/srafi1/pokemonstay/backend/spawn"
)

var upgrader = websocket.Upgrader{}
// TODO: use env for session key
var store = sessions.NewCookieStore([]byte("wow much secret"))

func GetSprite(w http.ResponseWriter, r *http.Request) {
	dex, ok := r.URL.Query()["dex"]
	if !ok || r.Method != "GET" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	url := fmt.Sprintf("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/%s.png", dex[0])
    http.Redirect(w, r, url, http.StatusMovedPermanently)
}

type Update struct {
    NewSpawns []spawn.Spawn `json:"spawn"`
    Despawn []spawn.Spawn `json:"despawn"`
}

func ServeWS(w http.ResponseWriter, r *http.Request) {
    _, err := store.Get(r, "caught-pokemon")
    if err != nil {
        log.Println(err)
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
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

    // pokemon that have been sent already
    sentSpawns := make([]spawn.Spawn, 0)

    for {
        mt, message, err := conn.ReadMessage()
        if err != nil {
            log.Println("Read error:", err)
            break
        }

        // parse coords
        var coords spawn.Coords
        err = json.Unmarshal(message, &coords)
        if err != nil {
            log.Println("Parse JSON error:", err)
            continue
        }
        // save new coords
        spawn.PutUser(username, coords)

        // get despawned pokemon
        update := &Update{
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
            found := false
            for _, val2 := range sentSpawns {
                if val1 == val2 {
                    found = true
                }
            }
            if !found {
                update.NewSpawns = append(update.NewSpawns, val1)
                sentSpawns = append(sentSpawns, val1)
            }
        }

        bytes, err := json.Marshal(update)
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
