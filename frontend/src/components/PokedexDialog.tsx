import React, { useState, useEffect } from 'react';
import theme from '../common/theme';
import { ThemeProvider, Dialog, DialogContent, Typography, CircularProgress, Box, Grid } from '@material-ui/core';

import bug from '../assets/types/bug.png';
import dark from '../assets/types/dark.png';
import dragon from '../assets/types/dragon.png';
import electric from '../assets/types/electric.png';
import fairy from '../assets/types/fairy.png';
import fighting from '../assets/types/fighting.png';
import fire from '../assets/types/fire.png';
import flying from '../assets/types/flying.png';
import ghost from '../assets/types/ghost.png';
import grass from '../assets/types/grass.png';
import ground from '../assets/types/ground.png';
import ice from '../assets/types/ice.png';
import normal from '../assets/types/normal.png';
import poison from '../assets/types/poison.png';
import psychic from '../assets/types/psychic.png';
import rock from '../assets/types/rock.png';
import steel from '../assets/types/steel.png';
import water from '../assets/types/water.png';
import PokemonListing from './PokemonListing';
import EvolutionDialog from './EvolutionDialog';

function typeToImg(t: string):string {
  switch (t) {
    case 'bug':
      return bug;
    case 'dark':
      return dark;
    case 'dragon':
      return dragon;
    case 'electric':
      return electric;
    case 'fairy':
      return fairy;
    case 'fighting':
      return fighting;
    case 'fire':
      return fire;
    case 'flying':
      return flying;
    case 'ghost':
      return ghost;
    case 'grass':
      return grass;
    case 'ground':
      return ground;
    case 'ice':
      return ice;
    case 'normal':
      return normal;
    case 'poison':
      return poison;
    case 'psychic':
      return psychic;
    case 'rock':
      return rock;
    case 'steel':
      return steel;
    case 'water':
      return water;
    default:
      return '';
  }
}

function capitalize(s: string):string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PokedexDialog(props: {
  dex: number,
  setDex: Function,
  userPokemon?: {dex: Number, name: string}[],
}) {
  const [loaded, setLoaded] = useState(false);
  const [pokemon, setPokemon] = useState({
    dex: 0,
    name: "",
    types: [""],
    description: "",
    evolutions: [{
      dex: 0,
      name: "",
    }],
  });
  const noEvolution = {
    fromDex: 0,
    fromName: "",
    toDex: 0,
    toName: "",
  };
  const [evolution, setEvolution] = useState(noEvolution);

  useEffect(() => {
    if (props.dex !== 0) {
      fetch(`/api/pokedex?dex=${props.dex}`)
      .then(res => res.json())
      .then(poke => {
        poke.description = poke.description.replace("\u000c", " ");
        setPokemon(poke);
        setLoaded(true);
      });
    }
    return () => setLoaded(false);
  }, [props.dex])

  const numPoke = props.userPokemon?.filter(p => p.dex === props.dex).length || 0;
  const hasThree = numPoke >= 3;
  const showEvolutions = pokemon.evolutions.length !== 0;

  const evolutions = (
    <Grid item xs={12}>
      <Box m={1} borderTop="1px solid white" />
      <Typography variant="h5">
        Evolve into:
      </Typography>
      {!hasThree && showEvolutions &&
        <Typography variant="h6">
          You need {3 - numPoke} more {capitalize(pokemon.name)} for an evolution
        </Typography>}
      {!showEvolutions &&
        <Typography variant="h6">None</Typography>}
      <Box display="flex" justifyContent="center">
        {pokemon.evolutions.map((p, i) => (
          <PokemonListing
            key={i}
            imgSize={100}
            dex={p.dex}
            showDex={false}
            name={p.name}
            silhouette={!hasThree}
            hidden={false}
            onClick={hasThree ? () => setEvolution({
              fromDex: pokemon.dex,
              fromName: pokemon.name,
              toDex: p.dex,
              toName: p.name,
            }) : undefined}/>
        ))}
      </Box>
    </Grid>
  );

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={props.dex !== 0}
        transitionDuration={100}
        PaperProps={{style: {backgroundColor: theme.palette.background.default}}}
        style={{textAlign: "center"}}
        maxWidth={false}
        onClose={() => props.setDex(0)}>
        <DialogContent>
          {!loaded ? <CircularProgress /> :
          <Box width={400}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="h4">
                  #{pokemon.dex}: {capitalize(pokemon.name)}
                </Typography>
              </Grid>
              <Grid item container xs={12}>
                <Grid item xs={8}>
                  <img alt="sprite" width={200} src={`/api/sprite?dex=${pokemon.dex}`} />
                </Grid>
                <Grid
                  item
                  container
                  xs={4}
                  spacing={2}
                  direction="column"
                  alignItems="center"
                  justify="center">
                  <Grid item>
                    <Typography variant="h6">Type(s):</Typography>
                  </Grid>
                  <Grid container justify="center">
                    {pokemon.types.map((t, i) => (
                      <Grid key={i} item xs={6}>
                        <img src={typeToImg(t)} width={50} />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">
                  {pokemon.description}
                </Typography>
              </Grid>
              {props.userPokemon !== undefined && evolutions}
            </Grid>
          </Box>
          }
        </DialogContent>
      </Dialog>
      <EvolutionDialog close={() => setEvolution(noEvolution)} {...evolution} />
    </ThemeProvider>
  );
}
export default PokedexDialog;
