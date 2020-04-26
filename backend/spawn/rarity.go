package spawn

import (
	"bufio"
	"encoding/csv"
	"io"
	"log"
	"os"
    "math/rand"
    "sort"
    "strconv"
)

var rarities []Pokemon

// lower rarity is more rare
type Pokemon struct {
    Dex int
    Rarity int
}

func initRarities() {
    rarities = make([]Pokemon, MAX_DEX)
	f, err := os.Open("./spawn/capture_rate.csv")
	if err != nil {
		log.Fatal(err)
	}
	fr := bufio.NewReader(f)
	r := csv.NewReader(fr)
    r.Read()
    dex := 0
	for {
		line, err := r.Read()
		if err == io.EOF {
			break
        } else if err != nil {
            log.Fatal(err)
        }
        rarity, err := strconv.ParseInt(line[1], 10, 32)
        if err != nil {
            log.Fatal(err)
        }
        rarities[dex] = Pokemon{
            Dex: dex + 1,
            Rarity: int(rarity),
        }
        dex++
	}
    sort.Slice(rarities, func(i, j int) bool {
        return rarities[i].Rarity < rarities[j].Rarity
    })
}

func randDex() int {
    minRarity := rand.Int() % 256
    minChoice := 0
    choice := rand.Int() % MAX_DEX
    for rarities[choice].Rarity < minRarity {
        minChoice = choice + 1
        choice = (rand.Int() % (MAX_DEX - minChoice)) + minChoice
    }
    return rarities[choice].Dex
}
