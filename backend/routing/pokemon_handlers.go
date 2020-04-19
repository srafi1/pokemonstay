package routing

import (
	"fmt"
	"net/http"
)

func GetSprite(w http.ResponseWriter, r *http.Request) {
	dex, ok := r.URL.Query()["dex"]
	if !ok || r.Method != "GET" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	url := fmt.Sprintf("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/%s.png", dex[0])
    http.Redirect(w, r, url, http.StatusMovedPermanently)
}
