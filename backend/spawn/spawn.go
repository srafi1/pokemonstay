package spawn

import (

)

type Coords struct {
    Lat float64 `json:"lat"`
    Lng float64 `json:"lng"`
}

type Spawn struct {
    Lat float64 `json:"lat"`
    Lng float64 `json:"lng"`
    Dex int16 `json:"dex"`
}

func GetSpawns(lat float64, lng float64) []Spawn {
    spawns := []Spawn{}
    spawns = append(spawns, Spawn{
        Lat: lat,
        Lng: lng - 0.0001,
        Dex: 1,
    })
    spawns = append(spawns, Spawn{
        Lat: lat,
        Lng: lng,
        Dex: 2,
    })
    spawns = append(spawns, Spawn{
        Lat: lat,
        Lng: lng + 0.0001,
        Dex: 3,
    })
    return spawns
}
