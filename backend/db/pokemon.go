package db

import (
    "context"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "github.com/srafi1/pokemonstay/backend/spawn"
)

type Encounter struct {
    spawn.Coords
    Dex int
    Caught bool
    User primitive.ObjectID
}

type Pokemon struct {
    spawn.Coords
    Dex int
    User primitive.ObjectID
}

func AddEncounter(username string, pokemon spawn.Spawn, caught bool) error {
    var user User
    filter := bson.M{"username": username}
    err := userCollection.FindOne(context.TODO(), filter).Decode(&user)
    if err != nil {
        return err
    }

    encounter := Encounter{
        pokemon.Coords,
        pokemon.Dex,
        caught,
        user.ID,
    }
    _, err = encounterCollection.InsertOne(context.TODO(), encounter)
    if err != nil {
        return err
    }

    if caught {
        pokemon := Pokemon{
            pokemon.Coords,
            pokemon.Dex,
            user.ID,
        }
        _, err = pokemonCollection.InsertOne(context.TODO(), pokemon)
        if err != nil {
            return err
        }
    }

    return nil
}
