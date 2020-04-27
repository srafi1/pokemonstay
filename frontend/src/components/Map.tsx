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
import EncounterDialog from './EncounterDialog';
import PostEncounterDialog from './PostEncounterDialog';

interface GameRefs {
  map: GoogleMap | undefined,
  setIsStanding: Function | undefined,
  paused: boolean,
  updateLoop: NodeJS.Timeout | undefined,
  wsLoop: NodeJS.Timeout | undefined,
  socket: WebSocket,
  keyDownFunc: (e: KeyboardEvent) => void,
  keyUpFunc: (e: KeyboardEvent) => void,
  movement: { x: number, y: number },
  pokemon: Spawn[],
  setPokemon: Function,
  encounter: any,
  setEncounter: Function,
  setPostEncounter: Function,
  setPostMessage: Function,
}

interface Coords {
  lat: number,
  lng: number,
}

interface Spawn extends Coords {
  dex: any,
}

const stepSize = 10;

const onKeyDown = (refs: GameRefs) => (event: KeyboardEvent) => {
  if (event.repeat) return;
  switch (event.code) {
    case 'ArrowDown':
    case 'KeyS':
      refs.movement.y = stepSize;
      break;
    case 'ArrowUp':
    case 'KeyW':
      refs.movement.y = -stepSize;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      refs.movement.x = -stepSize;
      break;
    case 'ArrowRight':
    case 'KeyD':
      refs.movement.x = stepSize;
      break;
  }
  const { x, y } = refs.movement;
  if (refs.setIsStanding !== undefined && (x !== 0 || y !== 0)) {
    refs.setIsStanding(false);
  }
}

const onKeyUp = (refs: GameRefs) => (event: KeyboardEvent) => {
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
  if (refs.map && !refs.paused) {
    const { x, y } = refs.movement;
    refs.map.panBy(x, y);
  }
}

const sendUpdate = (refs: GameRefs) => () => {
  if (refs.map !== undefined) {
    const update = {
      type: 'location',
      lat: refs.map.getCenter().lat(),
      lng: refs.map.getCenter().lng(),
    }
    refs.socket.send(JSON.stringify(update));
  }
}

const wsOnOpen = (refs: GameRefs) => () => {
  console.log('Connected to server');
  // don't start wsLoop until initial location is received from server
}

const wsOnClose = (refs: GameRefs) => () => {
  console.log('Disconnected from server');
  if (refs.wsLoop !== undefined) {
    clearInterval(refs.wsLoop);
    refs.wsLoop = undefined;
  }
  refs.setPokemon([]);
  const reconnect = () => {
    console.log('Attempting reconnection');
    refs.socket = new WebSocket(`wss://${window.location.host}/api/connect`);
    refs.socket.onopen = wsOnOpen(refs);
    refs.socket.onclose = wsOnClose(refs);
    refs.socket.onmessage = wsOnMessage(refs);
  }
  setTimeout(reconnect, 1000);
}

interface Update {
  type: string,
  lat: number,
  lng: number,
  spawn: Spawn[],
  despawn: Spawn[],
}

const wsOnMessage = (refs: GameRefs) => (event: MessageEvent) => {
  const update: Update = JSON.parse(event.data);
  if (update.type === "init" && refs.map !== undefined) {
    refs.map.panTo({lat: update.lat, lng: update.lng});
    if (refs.wsLoop === undefined) {
      // send location to server
      sendUpdate(refs)();
      refs.wsLoop = setInterval(sendUpdate(refs), 1000)
    }
  } else if (update.type === "spawn") {
    refs.pokemon.push(...update.spawn);
    const newPokemon = refs.pokemon.filter((poke1 => {
      let found = false;
      update.despawn.forEach(poke2 => {
        if (JSON.stringify(poke1) === JSON.stringify(poke2)) {
          found = true;
        }
      });
      return !found;
    }));
    refs.setPokemon(newPokemon);
  }
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
      paused: false,
      updateLoop: undefined,
      wsLoop: undefined,
      socket: new WebSocket(`wss://${window.location.host}/api/connect`),
      keyDownFunc: () => {},
      keyUpFunc: () => {},
      movement: { x: 0, y: 0 },
      pokemon: [],
      setPokemon: () => {},
      encounter: {},
      setEncounter: () => {},
      setPostEncounter: () => {},
      setPostMessage: () => {},
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
      setPokemonRefs: () => (pokemon: any[], setPokemon: Function, encounter: any, setEncounter: Function) => {
        refs.pokemon = pokemon;
        refs.setPokemon = setPokemon;
        refs.encounter = encounter;
        refs.setEncounter = setEncounter;
      },
      startEncounter: () => (pokemon: Spawn) => {
        refs.paused = true;
        refs.setEncounter({
          active: true,
          pokemon: pokemon,
        });
      },
      completeEncounter: () => (caught: boolean) => {
        refs.paused = false;
        const update = {
          type: "encounter",
          caught: caught,
          ...refs.encounter.pokemon,
        };
        refs.socket.send(JSON.stringify(update));
        // remove the pokemon marker
        const toRemove = JSON.stringify(refs.encounter.pokemon);
        const newPokemon = refs.pokemon.filter(poke => JSON.stringify(poke) !== toRemove);
        if (caught) {
          refs.setPostMessage('You caught the pokemon!');
        } else {
          refs.setPostMessage('The pokemon ran away!');
        }
        refs.setPostEncounter(true);
        refs.setPokemon(newPokemon);
        refs.setEncounter({active: false});
      },
      onUnmount: () => () => {
        if (!refs.map) {
          window.removeEventListener('keydown', refs.keyDownFunc);
          window.removeEventListener('keyup', refs.keyUpFunc);
          if (refs.updateLoop !== undefined) {
            clearInterval(refs.updateLoop);
          }
        }
      },
      postRefs: () => (setIsOpen: Function, setMessage: Function) => {
        refs.setPostEncounter = setIsOpen;
        refs.setPostMessage = setMessage;
      },
    }
  })
)((props: any) => {
  const [pokemon, setPokemon] = useState<Spawn[]>([]);
  const [encounter, setEncounter] = useState({active: false});
  props.setPokemonRefs(pokemon, setPokemon, encounter, setEncounter);
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
        {pokemon.map(poke => (
          <Marker
            key={`${poke.dex} ${poke.lat.toFixed(4)} ${poke.lng.toFixed(4)}`}
            position={{lat:poke.lat, lng:poke.lng}}
            onClick={() => props.startEncounter(poke)}
            icon={{
              url: `/api/sprite?dex=${poke.dex}`,
              scaledSize: {width: 150, height: 150},
            }} />
        ))}
      </GoogleMap>
      <PlayerSprite onMount={props.onPlayerMounted} />
      <GameMenu />
      <EncounterDialog
        encounter={encounter}
        complete={props.completeEncounter} />
      <PostEncounterDialog setRefs={props.postRefs} />
    </div>
  )
});

export default Map;
