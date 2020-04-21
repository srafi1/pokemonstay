package spawn

import (
    "math/rand"
    "sync"
    "time"
)

var allPokemon []Spawn
var spawnLock sync.RWMutex
var MAX_DEX = 807

type Coords struct {
    Lat float64 `json:"lat"`
    Lng float64 `json:"lng"`
}

type Spawn struct {
    Coords
    Dex int `json:"dex"`
    Despawn time.Time
}

func Init() {
    allPokemon = make([]Spawn, 0)
    spawnLock = sync.RWMutex{}
    origin := Coords{
        Lat: 40.76784,
        Lng: -73.963901,
    }
    rand.Seed(time.Now().UnixNano())
    go func() {
        for {
            spawnLock.Lock()
            // despawn old pokemon
            cutoff := 0
            now := time.Now()
            for cutoff < len(allPokemon) && now.After(allPokemon[cutoff].Despawn) {
                cutoff++
            }
            allPokemon = allPokemon[cutoff:]

            // spawn new pokemon
            pokemon := make([]Spawn, 10)
            for i:= 0; i < 10; i++ {
                p := Spawn{
                    Coords: origin,
                    Dex: (rand.Int() % MAX_DEX) + 1,
                    Despawn: time.Now().Add(time.Minute),
                }
                p.Lat -= (rand.Float64() * 2 - 1) / 200
                p.Lng -= (rand.Float64() * 2 - 1) / 200
                pokemon[i] = p
            }
            allPokemon = append(allPokemon, pokemon...)
            spawnLock.Unlock()
            time.Sleep(10*time.Second)
        }
    }()
}

func SpawnPokemon(pokemon []Spawn) {
    spawnLock.Lock()
    allPokemon = append(allPokemon, pokemon...)
    spawnLock.Unlock()
}

func GetSpawns(coords Coords) []Spawn {
    spawnLock.RLock()
    ret := make([]Spawn, len(allPokemon))
    copy(ret, allPokemon)
    spawnLock.RUnlock()
    return ret
}
