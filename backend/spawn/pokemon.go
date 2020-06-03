package spawn

import (
	"bufio"
	"encoding/csv"
	"io"
	"log"
	"os"
)

var names [MAX_DEX]string

func initPokemonNames() {
	f, err := os.Open("./data/pokemon_names.csv")
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
		if err != nil {
			log.Fatal(err)
		}
		names[dex] = line[1]
		dex++
	}
}

func PokemonName(dex int) string {
	return names[dex-1]
}
