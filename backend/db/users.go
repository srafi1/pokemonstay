package db

import (
    "context"

    "golang.org/x/crypto/bcrypt"
    "go.mongodb.org/mongo-driver/bson"
    "github.com/srafi1/pokemonstay/backend/spawn"
)

type Encounter struct {
    spawn.Spawn
    Caught bool
}

type User struct {
    Username string
    HashedPassword string
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
        username,
        string(hashedPassword),
        make([]Encounter, 0),
    }
    _, err = userCollection.InsertOne(context.TODO(), user)
    return err
}

func AddEncounter(username string, pokemon spawn.Spawn, caught bool) error {
    encounter := Encounter{pokemon, caught}
    _, err := userCollection.UpdateOne(
        context.TODO(),
        bson.M{"username": username},
        bson.D{
            {"$push", bson.D{{"encounters", encounter}}},
        },
    )
    return err
}
