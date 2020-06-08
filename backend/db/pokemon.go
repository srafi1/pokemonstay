package db

import (
	"context"
	"fmt"

	"github.com/srafi1/pokemonstay/backend/spawn"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Encounter struct {
	spawn.Coords
	Dex    int
	Caught bool
	User   primitive.ObjectID
}

type Pokemon struct {
	spawn.Coords
	Dex  int                `json:"dex"`
	User primitive.ObjectID `json:"-"`
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

	filter = bson.M{"_id": user.ID}
	update := bson.D{
		{"$set", bson.D{{
			fmt.Sprintf("pokedex.%d.encountered", pokemon.Dex-1),
			true,
		}}},
	}
	_, err = userCollection.UpdateOne(context.TODO(), filter, update)
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

		update = bson.D{
			{"$set", bson.D{{
				fmt.Sprintf("pokedex.%d.caught", pokemon.Dex-1),
				true,
			}}},
		}
		_, err = userCollection.UpdateOne(context.TODO(), filter, update)
		if err != nil {
			return err
		}
	}

	return nil
}

func GetPokemon(username string) ([]Pokemon, error) {
	var user User
	filter := bson.M{"username": username}
	err := userCollection.FindOne(context.TODO(), filter).Decode(&user)
	if err != nil {
		return nil, err
	}

	var pokemon []Pokemon
	filter = bson.M{"user": user.ID}
	cursor, err := pokemonCollection.Find(context.TODO(), filter)
	if err != nil {
		return nil, err
	}

	err = cursor.All(context.TODO(), &pokemon)
	if err != nil {
		return nil, err
	}

	return pokemon, nil
}
