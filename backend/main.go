package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

	"github.com/srafi1/pokemonstay/backend/db"
	"github.com/srafi1/pokemonstay/backend/routing"
	"github.com/srafi1/pokemonstay/backend/spawn"
)

func main() {
	db.ConnectDB()
	spawn.Init()
	routing.Init()

	// proxy to frontend (for development)
	url, _ := url.Parse("http://localhost:3000")
	proxy := httputil.NewSingleHostReverseProxy(url)
	http.HandleFunc("/", proxy.ServeHTTP)

	// serve frontend (for production)
	//http.HandleFunc("/", routing.StaticFrontend)

	// auth routes
	http.HandleFunc("/api/login", routing.Login)
	http.HandleFunc("/api/register", routing.Register)
	http.HandleFunc("/api/auth", routing.Refresh)
	http.HandleFunc("/api/logout", routing.Logout)

	// pokemon routes
	http.HandleFunc("/api/sprite", routing.GetSprite)
	http.HandleFunc("/api/pokedex", routing.GetPokedex)
	http.HandleFunc("/api/pokemon", routing.GetPokemon)
	http.HandleFunc("/api/evolve", routing.Evolve)

	// websocket route
	http.HandleFunc("/api/connect", routing.ServeWS)

	port := 5000
	portEnv := os.Getenv("PORT")
	if portEnv != "" {
		_, err := fmt.Sscanf(portEnv, "%d", &port)
		if err != nil {
			log.Fatal("Invalid PORT")
		}
	}
	fmt.Printf("Listening on port %d\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
