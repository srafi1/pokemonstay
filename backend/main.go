package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    // auth routes
    http.HandleFunc("/login", Login)
    http.HandleFunc("/register", Register)
    http.HandleFunc("/auth", Auth)

    port := 5000
    fmt.Printf("Listening on port %d\n", port)
    log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
