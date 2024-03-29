package routing

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/srafi1/pokemonstay/backend/db"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey []byte

type Credentials struct {
	Username        string `json:"username"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
}

type Claims struct {
	jwt.StandardClaims
	Username string `json:"username"`
}

func Init() {
	jwtKeyEnv := os.Getenv("JWT_KEY")
	if jwtKeyEnv == "" {
		log.Fatal("Missing JWT_KEY")
	} else {
		jwtKey = []byte(jwtKeyEnv)
	}
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
	if r.Method != "POST" || err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	user, err := db.GetUser(creds.Username)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(creds.Password))
	if err != nil {
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
		Name:    "token",
		Value:   tokenString,
		Expires: expirationTime,
	})
}

func Logout(w http.ResponseWriter, r *http.Request) {
	expirationTime := time.Now()
	http.SetCookie(w, &http.Cookie{
		Name:    "token",
		Expires: expirationTime,
	})
}

func Register(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if r.Method != "POST" || err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	_, err = db.GetUser(creds.Username)
	if err == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("That username is taken"))
		return
	} else if creds.Password != creds.ConfirmPassword {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Passwords must match"))
		return
	}

	db.CreateUser(creds.Username, creds.Password)

	token, expirationTime := createToken(creds.Username)

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:    "token",
		Value:   tokenString,
		Expires: expirationTime,
	})
}

// check if token is valid and set headers
func validAuth(w http.ResponseWriter, r *http.Request) (error, *Claims) {
	tokenCookie, err := r.Cookie("token")
	if err != nil {
		if err == http.ErrNoCookie {
			w.WriteHeader(http.StatusUnauthorized)
			return err, nil
		}
		w.WriteHeader(http.StatusBadRequest)
		return err, nil
	}

	tokenString := tokenCookie.Value
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if !token.Valid {
		w.WriteHeader(http.StatusUnauthorized)
		return err, nil
	}
	if err != nil {
		if err == jwt.ErrSignatureInvalid {
			w.WriteHeader(http.StatusUnauthorized)
			return err, nil
		}
		w.WriteHeader(http.StatusBadRequest)
		return err, nil
	}
	return nil, claims
}

func Refresh(w http.ResponseWriter, r *http.Request) {
	err, claims := validAuth(w, r)
	if err != nil || claims.ExpiresAt > time.Now().Add(time.Hour).Unix() {
		return
	}
	// if token expires within an hour, refresh
	token, expirationTime := createToken(claims.Username)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:    "token",
		Value:   tokenString,
		Expires: expirationTime,
	})
}
