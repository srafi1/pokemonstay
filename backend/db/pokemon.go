package db

import (
	"context"
	"fmt"
	"log"

	"github.com/srafi1/pokemonstay/backend/spawn"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Encounter struct {
	spawn.Coords
	Dex    int
	Caught bool
	User   primitive.ObjectID
}

type Pokemon struct {
	spawn.Coords
	ID   primitive.ObjectID `bson:"_id,omitempty"`
	Dex  int                `json:"dex"`
	User primitive.ObjectID `json:"-"`
}

func AddEncounter(username string, pokemon spawn.Spawn, caught bool) error {
	user, err := GetUser(username)
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

	filter := bson.M{"_id": user.ID}
	update := bson.M{
		"$set": bson.M{
			fmt.Sprintf("pokedex.%d.encountered", pokemon.Dex-1): true,
		},
	}
	_, err = userCollection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		return err
	}

	if caught {
		pokemon := Pokemon{
			Coords: pokemon.Coords,
			Dex:    pokemon.Dex,
			User:   user.ID,
		}
		_, err = pokemonCollection.InsertOne(context.TODO(), pokemon)
		if err != nil {
			return err
		}

		update = bson.M{
			"$set": bson.M{
				fmt.Sprintf("pokedex.%d.caught", pokemon.Dex-1): true,
			},
		}
		_, err = userCollection.UpdateOne(context.TODO(), filter, update)
		if err != nil {
			return err
		}
	}

	return nil
}

func GetPokemon(username string) ([]Pokemon, error) {
	user, err := GetUser(username)
	if err != nil {
		return nil, err
	}

	var pokemon []Pokemon
	filter := bson.M{"user": user.ID}
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

func Evolve(username string, fromDex, toDex int) error {
	user, err := GetUser(username)
	if err != nil {
		return err
	}

	limit := options.Find()
	limit.SetLimit(3)
	filter := bson.M{"user": user.ID, "dex": fromDex}
	cursor, err := pokemonCollection.Find(context.TODO(), filter, limit)
	if err != nil {
		return err
	}

	var pokemon []Pokemon
	err = cursor.All(context.TODO(), &pokemon)
	if err != nil {
		return err
	}

	// modify first one to be evolved
	update := bson.M{"$set": bson.M{"dex": toDex}}
	filter = bson.M{"_id": pokemon[0].ID}
	_, err = pokemonCollection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		return err
	}

	// delete last two
	for _, p := range pokemon[1:] {
		filter = bson.M{"_id": p.ID}
		_, err = pokemonCollection.DeleteOne(context.TODO(), filter)
		if err != nil {
			log.Println(err)
		}
	}

	// add to pokedex
	update = bson.M{
		"$set": bson.M{
			fmt.Sprintf("pokedex.%d.caught", toDex-1): true,
			fmt.Sprintf("pokedex.%d.encountered", toDex-1): true,
		},
	}
	filter = bson.M{"_id": user.ID}
	_, err = userCollection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		log.Println(err)
	}

	return nil
}
