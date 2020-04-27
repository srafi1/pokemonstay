package db

import (
    "context"
    "fmt"
    "log"
    "os"

    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

var client mongo.Client
var userCollection *mongo.Collection

func ConnectDB() {
    var clientOptions *options.ClientOptions
    uri := os.Getenv("MONGO_URI")
    if uri == "" {
        clientOptions = options.Client().ApplyURI("mongodb://localhost:27017")
    } else {
        clientOptions = options.Client().ApplyURI(uri)
    }

    // Connect to MongoDB
    client, err := mongo.Connect(context.TODO(), clientOptions)

    if err != nil {
        log.Fatal(err)
    }

    // Check the connection
    err = client.Ping(context.TODO(), nil)

    if err != nil {
        log.Fatal(err)
    }

    userCollection = client.Database("pokemonstay").Collection("users")

    fmt.Println("Connected to MongoDB!")
}
