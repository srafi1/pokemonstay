import React, { useState, useEffect } from 'react';
import theme from '../common/theme';
import { ThemeProvider, Dialog, DialogContent, Typography, CircularProgress, Box } from '@material-ui/core';

function capitalize(s: string):string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PokedexDialog(props: {
  dex: number,
  setDex: Function,
}) {
  const [loaded, setLoaded] = useState(false);
  const [pokemon, setPokemon] = useState({
    dex: 0,
    name: "",
    description: "",
  });

  useEffect(() => {
    if (props.dex !== 0) {
      fetch(`/api/pokedex?dex=${props.dex}`)
      .then(res => res.json())
      .then(poke => {
        setPokemon(poke);
        setLoaded(true);
      });
    }
    return () => setLoaded(false);
  }, [props.dex])

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
            <Typography variant="h4">
              #{pokemon.dex}: {capitalize(pokemon.name)}
            </Typography>
            <img alt="sprite" width={200} src={`/api/sprite?dex=${pokemon.dex}`} />
            <Typography variant="h6">
              {pokemon.description}
            </Typography>
          </Box>
          }
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
export default PokedexDialog;
