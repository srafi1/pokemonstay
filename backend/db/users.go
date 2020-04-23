package db

import (
    "context"

    "golang.org/x/crypto/bcrypt"
    "go.mongodb.org/mongo-driver/bson"
    "github.com/srafi1/pokemonstay/backend/spawn"
)

type Encounter struct {
    spawn.Coords
    Dex int
    Caught bool
}

type User struct {
    Username string
    HashedPassword string
    Location *spawn.Coords
    Encounters []Encounter
}

func GetUser(username string) (User, error) {
    var user User
    filter := bson.M{"username": username}
    err := userCollection.FindOne(context.TODO(), filter).Decode(&user)
    return user, err
}

func CreateUser(username string, password string) error {
    hashedPassword, err := bcrypt.GenerateFromPassword(
        []byte(password),
        bcrypt.DefaultCost,
    )
    if err != nil {
        return err
    }
    user := User{
        Username: username,
        HashedPassword: string(hashedPassword),
        Location: &spawn.Coords{
            Lat: 40.76784,
            Lng: -73.963901,
        },
        Encounters: make([]Encounter, 0),
    }
    _, err = userCollection.InsertOne(context.TODO(), user)
    return err
}

func SetLocation(username string, location spawn.Coords) error {
    _, err := userCollection.UpdateOne(
        context.TODO(),
        bson.M{"username": username},
        bson.D{
            {"$set", bson.D{{"location", location}}},
        },
    )
    return err
}

func AddEncounter(username string, pokemon spawn.Spawn, caught bool) error {
    encounter := Encounter{
        pokemon.Coords,
        pokemon.Dex,
        caught,
    }
    _, err := userCollection.UpdateOne(
        context.TODO(),
        bson.M{"username": username},
        bson.D{
            {"$push", bson.D{{"encounters", encounter}}},
        },
    )
    return err
}

