package spawn

import (
    "math/rand"
    "sync"
    "time"
)

var pokemonQueue []Spawn
var userLocs map[string]Coords
var spawnLock sync.RWMutex
var userEncounters map[string]map[Spawn]bool
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
    pokemonQueue = make([]Spawn, 0)
    userLocs = make(map[string]Coords, 0)
    spawnLock = sync.RWMutex{}
    userEncounters = make(map[string]map[Spawn]bool)
    rand.Seed(time.Now().UnixNano())
    go func() {
        for {
            spawnLock.Lock()
            // despawn old pokemon
            cutoff := 0
            now := time.Now()
            for cutoff < len(pokemonQueue) && now.After(pokemonQueue[cutoff].Despawn) {
                cutoff++
            }
            pokemonQueue = pokemonQueue[cutoff:]

            // spawn new pokemon per user
            despawnTime := time.Now().Add(time.Minute)
            for _, loc := range userLocs {
                pokemon := make([]Spawn, 10)
                for i:= 0; i < 10; i++ {
                    p := Spawn{
                        Coords: loc,
                        Dex: (rand.Int() % MAX_DEX) + 1,
                        Despawn: despawnTime,
                    }
                    p.Lat -= (rand.Float64() * 2 - 1) / 200
                    p.Lng -= (rand.Float64() * 2 - 1) / 200
                    pokemon[i] = p
                }
                pokemonQueue = append(pokemonQueue, pokemon...)
            }
            spawnLock.Unlock()
            time.Sleep(10*time.Second)
        }
    }()
}

func SpawnPokemon(pokemon []Spawn) {
    spawnLock.Lock()
    pokemonQueue = append(pokemonQueue, pokemon...)
    spawnLock.Unlock()
}

func GetSpawns(coords Coords) []Spawn {
    spawnLock.RLock()
    ret := make([]Spawn, len(pokemonQueue))
    copy(ret, pokemonQueue)
    spawnLock.RUnlock()
    return ret
}

func PutUser(user string, loc Coords) {
    spawnLock.Lock()
    userLocs[user] = loc
    spawnLock.Unlock()
    if _, ok := userEncounters[user]; !ok {
        userEncounters[user] = make(map[Spawn]bool)
    }
}

func RemoveUser(user string) {
    spawnLock.Lock()
    delete(userLocs, user)
    spawnLock.Unlock()
}

func AddEncounter(user string, pokemon Spawn) {
    userEncounters[user][pokemon] = true
}

func GetEncounters(user string) map[Spawn]bool {
    encounters, _ := userEncounters[user]
    return encounters
}

func CleanupEncounters(user string) {
    encounters, ok := userEncounters[user]
    if ok {
        now := time.Now()
        for k := range encounters {
            if now.After(k.Despawn) {
                delete(encounters, k)
            }
        }
    }
}
