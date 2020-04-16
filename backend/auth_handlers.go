package main

import (
    "encoding/json"
    "github.com/dgrijalva/jwt-go"
    "net/http"
    "time"
)

var jwtKey = []byte("super secrety")

var users = map[string]string{}

type Credentials struct {
    Username string `json:"username"`
    Password string `json:"password"`
    ConfirmPassword string `json:"confirmPassword"`
}

type Claims struct {
    Username string `json:"username"`
    jwt.StandardClaims
}

func createToken(username string) (*jwt.Token, time.Time) {
    expirationTime := time.Now().Add(24 * time.Hour)
    claims := &Claims{
        Username: username,
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: expirationTime.Unix(),
        },
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token, expirationTime
}

func Login(w http.ResponseWriter, r *http.Request) {
    var creds Credentials
    err := json.NewDecoder(r.Body).Decode(&creds)
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    expectedPassword, ok := users[creds.Username]

    if !ok || expectedPassword != creds.Password {
        w.WriteHeader(http.StatusUnauthorized)
        return
    }

    token, expirationTime := createToken(creds.Username)

    tokenString, err := token.SignedString(jwtKey)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    http.SetCookie(w, &http.Cookie{
        Name: "token",
        Value: tokenString,
        Expires: expirationTime,
    })
}

func Register(w http.ResponseWriter, r *http.Request) {
    var creds Credentials
    err := json.NewDecoder(r.Body).Decode(&creds)
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    _, exists := users[creds.Username]
    if exists || creds.Password != creds.ConfirmPassword {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    users[creds.Username] = creds.Password

    token, expirationTime := createToken(creds.Username)

    tokenString, err := token.SignedString(jwtKey)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    http.SetCookie(w, &http.Cookie{
        Name: "token",
        Value: tokenString,
        Expires: expirationTime,
    })
}

func Auth(w http.ResponseWriter, r *http.Request) {
    tokenCookie, err := r.Cookie("token")
    if err != nil {
        if err == http.ErrNoCookie {
            w.WriteHeader(http.StatusUnauthorized)
            return
        }
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    tokenString := tokenCookie.Value
    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil
    })
    if !token.Valid {
        w.WriteHeader(http.StatusUnauthorized)
        return
    }
    if err != nil {
        if err == jwt.ErrSignatureInvalid {
            w.WriteHeader(http.StatusUnauthorized)
            return
        }
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    token, expirationTime := createToken(claims.Username)
    tokenString, err = token.SignedString(jwtKey)
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    http.SetCookie(w, &http.Cookie{
        Name: "token",
        Value: tokenString,
        Expires: expirationTime,
    })
}
