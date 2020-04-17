package db

import (
    "context"

    "golang.org/x/crypto/bcrypt"
    "go.mongodb.org/mongo-driver/bson"
)

type User struct {
    Username string
    HashedPassword string
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
    }
    _, err = userCollection.InsertOne(context.TODO(), user)
    return err
}
