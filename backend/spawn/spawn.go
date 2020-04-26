package spawn

import (
	"math/rand"
	"sync"
	"time"
)

var pokemonQueue []Spawn
var globalQuadTree *QuadTree
var userLocs map[string]Coords
var spawnLock sync.RWMutex
var userEncounters map[string]map[Spawn]bool

const MAX_DEX = 807
const SPAWN_RANGE = 0.003
const MAX_IN_AREA = 50

type Coords struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type Spawn struct {
	Coords
	Dex     int `json:"dex"`
	Despawn time.Time
}

func Init() {
	pokemonQueue = make([]Spawn, 0)
	globalQuadTree = NewQuadTree()
	userLocs = make(map[string]Coords, 0)
	spawnLock = sync.RWMutex{}
	userEncounters = make(map[string]map[Spawn]bool)
	initRarities()
	rand.Seed(time.Now().UnixNano())

	go func() {
		for {
			// despawn old pokemon
			spawnLock.Lock()
			cutoff := 0
			now := time.Now()
			for cutoff < len(pokemonQueue) && now.After(pokemonQueue[cutoff].Despawn) {
				globalQuadTree.Remove(pokemonQueue[cutoff])
				cutoff++
			}
			pokemonQueue = pokemonQueue[cutoff:]
            spawnLock.Unlock()

			// spawn new pokemon per user
			despawnTime := time.Now().Add(time.Minute)
            toSpawn := make([]Spawn, 0)
			for _, loc := range userLocs {
                numLocal := len(GetSpawns(loc))
                maxNew := MAX_IN_AREA - numLocal
                numNew := 0
                if maxNew > 0 {
                    numNew = rand.Int() % maxNew
                }
				pokemon := make([]Spawn, numNew)
				for i := 0; i < numNew; i++ {
					p := Spawn{
						Coords:  loc,
						Dex:     randDex(),
						Despawn: despawnTime,
					}
					p.Lat -= (rand.Float64()*2 - 1) * SPAWN_RANGE
					p.Lng -= (rand.Float64()*2 - 1) * SPAWN_RANGE
					pokemon[i] = p
				}
                toSpawn = append(toSpawn, pokemon...)
			}

            spawnLock.Lock()
            pokemonQueue = append(pokemonQueue, toSpawn...)
            for _, p := range toSpawn {
                globalQuadTree.Add(p)
            }
            spawnLock.Unlock()

            time.Sleep(10*time.Second)
        }
    }()
}

func GetSpawns(c Coords) []Spawn {
	spawnLock.RLock()
	ret := globalQuadTree.GetInRange(Bounds{
		MinLat: c.Lat - SPAWN_RANGE,
		MaxLat: c.Lat + SPAWN_RANGE,
		MinLng: c.Lng - SPAWN_RANGE,
		MaxLng: c.Lng + SPAWN_RANGE,
	})
	spawnLock.RUnlock()
	return ret
}

func PutUser(user string, loc Coords) {
	userLocs[user] = loc
	if _, ok := userEncounters[user]; !ok {
		userEncounters[user] = make(map[Spawn]bool)
	}
}

func RemoveUser(user string) {
	delete(userLocs, user)
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
