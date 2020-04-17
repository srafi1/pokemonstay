package main

import (
    "fmt"
    "log"
    "net/http"

    "github.com/srafi1/pokemonstay/backend/routing"
    "github.com/srafi1/pokemonstay/backend/db"
)

func main() {
    db.ConnectDB()

    // auth routes
    http.HandleFunc("/api/login", routing.Login)
    http.HandleFunc("/api/register", routing.Register)
    http.HandleFunc("/api/auth", routing.Auth)

    port := 5000
    fmt.Printf("Listening on port %d\n", port)
    log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
