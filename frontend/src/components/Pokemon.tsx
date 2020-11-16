import React, {useState} from 'react';
import {
  Box,
  Button,
  Icon,
  ThemeProvider,
  CircularProgress,
  Typography,
  makeStyles
} from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import theme from '../common/theme';
import Header from './Header';
import PokemonListing from './PokemonListing';
import PokedexDialog from './PokedexDialog';

const dateAsc = (a: any, b: any) => a.date - b.date;
const dateDec = (a: any, b: any) => b.date - a.date;
const dexAsc = (a: any, b: any) => a.dex - b.dex;
const dexDec = (a: any, b: any) => b.dex - a.dex;
const nameAsc = (a: any, b: any) => a.name < b.name ? -1 : 1;
const nameDec = (a: any, b: any) => a.name > b.name ? -1 : 1;

const useStyles = makeStyles(theme => ({
  basic: {
    margin: theme.spacing(1),
  },
  highlight: {
    color: theme.palette.error.main,
    margin: theme.spacing(1),
  },
}));

function SortToggle(props: {
  name: string,
  asc: (a: any, b: any) => number,
  dec: (a: any, b: any) => number,
  currentFunc: (a: any, b: any) => number,
  setter: (func: any) => void
}) {
  const styles = useStyles();
  let highlight = false;
  let icon: JSX.Element = <></>;
  if (props.currentFunc === props.asc) {
    highlight = true;
    icon = <Icon><ArrowUpwardIcon /></Icon>;
  } else if (props.currentFunc === props.dec) {
    highlight = true;
    icon = <Icon><ArrowDownwardIcon /></Icon>;
  }
  const onClick = () => {
    if (props.currentFunc === props.asc) {
      props.setter(() => props.dec);
    } else {
      props.setter(() => props.asc);
    }
  }
  return (
    <Button
      variant="outlined"
      className={highlight ? styles.highlight : styles.basic}
      onClick={onClick}
      endIcon={icon}>
      {props.name}
    </Button>
  );
}

function Pokemon() {
  const [loaded, setLoaded] = useState(false);
  const [dex, setDex] = useState(0);
  const [pokemon, setPokemon] = useState([{
    date: 0,
    lat: 0,
    lng: 0,
    dex: 0,
    name: "",
  }]);
  const [sortFunc, setSortFunc] = useState(() => dateDec);

  if (!loaded) {
    fetch('/api/pokemon', {
      credentials: 'same-origin',
    })
    .then((res: Response) => {
      if (res.status !== 200) {
        console.log('Failed to retrieve pokemon');
      } else {
        res.json().then((json: any[]) => {
          {setPokemon(json.map((p, i) => ({date: i, ...p})));}
        });
      }
      setLoaded(true);
    });
  }

  const pokemonCounts: {[dex: number]: number} = {};
  for (let i in pokemon) {
    const p = pokemon[i];
    if (p.dex in pokemonCounts) {
      pokemonCounts[p.dex]++;
    } else {
      pokemonCounts[p.dex] = 1;
    }
  }

  const pokemonComponents = pokemon.map(p => p).sort(sortFunc).map((p, i) => (
    <PokemonListing
      key={i}
      dex={p.dex}
      name={p.name}
      showDex={false}
      hidden={false}
      silhouette={false}
      highlight={pokemonCounts[p.dex] >= 3}
      onClick={() => setDex(p.dex)} />
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
        <Box p={1}>
          <Typography variant="h5">
            Sort:
            <SortToggle
              name="Date Caught"
              asc={dateAsc}
              dec={dateDec}
              currentFunc={sortFunc}
              setter={setSortFunc} />
            <SortToggle
              name="Name"
              asc={nameAsc}
              dec={nameDec}
              currentFunc={sortFunc}
              setter={setSortFunc} />
            <SortToggle
              name="Pokedex #"
              asc={dexAsc}
              dec={dexDec}
              currentFunc={sortFunc}
              setter={setSortFunc} />
          </Typography>
        </Box>
        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
          {loaded ? pokemonComponents : <CircularProgress />}
        </Box>

        <PokedexDialog dex={dex} setDex={setDex} userPokemon={pokemon} />
      </Box>
    </ThemeProvider>
  );
}

export default Pokemon;

