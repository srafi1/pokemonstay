import React, { useState } from 'react';
import { Box, ThemeProvider, CircularProgress } from '@material-ui/core';
import theme from '../common/theme';
import Header from './Header';
import PokemonListing from './PokemonListing';
import PokedexDialog from './PokedexDialog';

function Pokemon() {
  const [loaded, setLoaded] = useState(false);
  const [dex, setDex] = useState(0);
  const [pokemon, setPokemon] = useState([{
    lat: 0,
    lng: 0,
    dex: 0,
    name: "",
  }]);

  if (!loaded) {
    fetch('/api/pokemon', {
      credentials: 'same-origin',
    })
    .then((res: Response) => {
      if (res.status !== 200) {
        console.log('Failed to retrieve pokemon');
      } else {
        res.json().then((json: any[]) => {
          setPokemon(json);
        });
      }
      setLoaded(true);
    });
  }

  const pokemonComponents = pokemon.map((pokemon, i) => (
    <PokemonListing
      key={i}
      dex={pokemon.dex}
      name={pokemon.name}
      showDex={false}
      hidden={false}
      silhouette={false}
      onClick={() => setDex(pokemon.dex)} />
  ));

  return (
    <ThemeProvider theme={theme}>
      <Box
        minHeight={1}
        bgcolor="background.default"
        color="text.primary"
        display="flex"
        flexDirection="column"
        alignItems="center">
        <Header page="Pokemon" />
        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
          {loaded ? pokemonComponents : <CircularProgress />}
        </Box>
        
        <PokedexDialog dex={dex} setDex={setDex} userPokemon={pokemon} />
      </Box>
    </ThemeProvider>
  );
}

export default Pokemon;

