package routing

import (
	"fmt"
    "log"
	"net/http"

    "github.com/gorilla/websocket"
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
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }

    for {
        mt, message, err := conn.ReadMessage()
        if err != nil {
            log.Println("Read error: ", err)
        }
        log.Println("Message received: ", string(message))
        err = conn.WriteMessage(mt, []byte("Gotcha"))
        if err != nil {
            log.Println("Write error: ", err)
        }
    }
}
