import React, { useState, useEffect } from 'react';
import { Box } from '@material-ui/core';
import {
  GoogleMap,
  withScriptjs,
  withGoogleMap,
  Marker
} from 'react-google-maps';
import { compose, withProps, withHandlers } from 'recompose';
import Loading from './Loading';
import PlayerSprite from './PlayerSprite';
import GameMenu from './GameMenu';

interface GameRefs {
  map: GoogleMap | undefined,
  setIsStanding: Function | undefined,
  updateLoop: NodeJS.Timeout | undefined,
  wsLoop: NodeJS.Timeout | undefined,
  socket: WebSocket,
  keyDownFunc: (e: KeyboardEvent) => void,
  keyUpFunc: (e: KeyboardEvent) => void,
  movement: { x: number, y: number },
  pokemon: any[],
  setPokemon: Function,
}

interface Coords {
  lat: any,
  lng: any,
}

interface Spawn extends Coords {
  dex: any,
}

const stepSize = 10;

const onKeyDown = (refs: GameRefs) => (event: KeyboardEvent) => {
  event.preventDefault();
  if (event.repeat) return;
  switch (event.code) {
    case 'ArrowDown':
    case 'KeyS':
      refs.movement.y += stepSize;
      break;
    case 'ArrowUp':
    case 'KeyW':
      refs.movement.y -= stepSize;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      refs.movement.x -= stepSize;
      break;
    case 'ArrowRight':
    case 'KeyD':
      refs.movement.x += stepSize;
      break;
  }
  const { x, y } = refs.movement;
  if (refs.setIsStanding !== undefined && (x !== 0 || y !== 0)) {
    refs.setIsStanding(false);
  }
}

const onKeyUp = (refs: GameRefs) => (event: KeyboardEvent) => {
  event.preventDefault();
  switch (event.code) {
    case 'ArrowDown':
    case 'KeyS':
    case 'ArrowUp':
    case 'KeyW':
      refs.movement.y = 0;
      break;
    case 'ArrowLeft':
    case 'KeyA':
    case 'ArrowRight':
    case 'KeyD':
      refs.movement.x = 0;
      break;
  }
  const { x, y } = refs.movement;
  if (refs.setIsStanding !== undefined && x === 0 && y === 0) {
    refs.setIsStanding(true);
  }
}

const update = (refs: GameRefs) => () => {
  if (refs.map) {
    const { x, y } = refs.movement;
    refs.map.panBy(x, y);
  }
}

const wsOnOpen = (refs: GameRefs) => (event: Event):any => {
  console.log('ws opened');
  // send location to server
  refs.wsLoop = setInterval(() => {
    if (refs.map !== undefined) {
      const coords: Coords = {
        lat: refs.map.getCenter().lat(),
        lng: refs.map.getCenter().lng(),
      }
      refs.socket.send(JSON.stringify(coords));
    }
  }, 5000)
}

const wsOnClose = (refs: GameRefs) => (event: CloseEvent) => {
  console.log('ws closed');
  if (refs.wsLoop !== undefined) {
    clearInterval(refs.wsLoop);
  }
}

const wsOnMessage = (refs: GameRefs) => (event: MessageEvent) => {
  console.log('ws received:', event.data);
  const spawn: Spawn[] = JSON.parse(event.data);
  const newPokemon = spawn.map((pokemon, i) => (
    <Marker
      key={i}
      position={pokemon}
      icon={{
      url: `/api/sprite?dex=${pokemon.dex}`,
      scaledSize: {width: 150, height: 150},
      }} />
  ));
  refs.setPokemon(newPokemon);
}

const Map = compose(
  // this api key is locked to *.shakilrafi.com
  withProps({
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyAC4hh69r1rQ-rCtDZ8muFywZQFKp3_ZsM&v=3.exp",
    loadingElement: <Loading />,
    containerElement: <Box height={1} />,
    mapElement: <Box height={1} />
  }),
  withScriptjs,
  withGoogleMap,
  withHandlers(() => {
    const refs: GameRefs = {
      map: undefined,
      setIsStanding: undefined,
      updateLoop: undefined,
      wsLoop: undefined,
      socket: new WebSocket(`ws://${window.location.host}/api/connect`),
      keyDownFunc: () => {},
      keyUpFunc: () => {},
      movement: { x: 0, y: 0 },
      pokemon: [],
      setPokemon: () => {console.log('no')},
    };
    refs.socket.onopen = wsOnOpen(refs);
    refs.socket.onclose = wsOnClose(refs);
    refs.socket.onmessage = wsOnMessage(refs);
    return {
      onMapMounted: () => (ref: GoogleMap) => {
        if (ref) {
          refs.map = ref;
          refs.keyDownFunc = onKeyDown(refs);
          refs.keyUpFunc = onKeyUp(refs);
          window.addEventListener('keydown', refs.keyDownFunc);
          window.addEventListener('keyup', refs.keyUpFunc);
          refs.updateLoop = setInterval(update(refs), 50);
        }
      },
      onPlayerMounted: () => (setter: Function) => {
        refs.setIsStanding = setter;
      },
      setPokemonRefs: () => (pokemon: any[], setPokemon: Function) => {
        refs.pokemon = pokemon;
        refs.setPokemon = setPokemon;
      },
      onUnmount: () => () => {
        if (!refs.map) {
          window.removeEventListener('keydown', refs.keyDownFunc);
          window.removeEventListener('keyup', refs.keyUpFunc);
          if (refs.updateLoop !== undefined) {
            clearInterval(refs.updateLoop);
          }
        }
      }
    }
  })
)((props: any) => {
  const [pokemon, setPokemon] = useState([]);
  props.setPokemonRefs(pokemon, setPokemon);
  useEffect(() => props.onUnmount);
  return (
    <div>
      <GoogleMap
        zoom={20}
        defaultCenter={{ lat: 40.76784, lng: -73.963901 }}
        clickableIcons={false}
        ref={props.onMapMounted}
        options={{
          keyboardShortcuts: false,
          disableDefaultUI: true,
          gestureHandling: 'none'
        }} >
        {pokemon}
      </GoogleMap>
      <PlayerSprite onMount={props.onPlayerMounted} />
      <GameMenu />
    </div>
  )
});

export default Map;
