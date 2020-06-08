package db

import (
	"context"

	"github.com/srafi1/pokemonstay/backend/spawn"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	Username       string
	HashedPassword string
	Location       *spawn.Coords
	Pokedex        [spawn.MAX_DEX]struct {
		Encountered bool `json:"encountered"`
		Caught      bool `json:"caught"`
	}
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
		Username:       username,
		HashedPassword: string(hashedPassword),
		Location: &spawn.Coords{
			Lat: 40.76784,
			Lng: -73.963901,
		},
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
