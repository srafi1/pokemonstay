import React from 'react';
import { Box } from '@material-ui/core';
import { GoogleMap, withScriptjs, withGoogleMap } from 'react-google-maps';
import { compose, withProps, withHandlers } from 'recompose';
import Loading from './Loading';

interface GameRefs {
  map: GoogleMap | undefined,
  player: any,
  updateLoop: NodeJS.Timeout | undefined,
  movement: { x: number, y: number },
}

const stepSize = 10;

const onKeyDown = (refs: GameRefs) => (event: KeyboardEvent) => {
  if (event.repeat) return;
  switch (event.code) {
    case 'ArrowDown':
      refs.movement.y += stepSize;
      break;
    case 'ArrowUp':
      refs.movement.y -= stepSize;
      break;
    case 'ArrowLeft':
      refs.movement.x -= stepSize;
      break;
    case 'ArrowRight':
      refs.movement.x += stepSize;
      break;
  }
}

const onKeyUp = (refs: GameRefs) => (event: KeyboardEvent) => {
  switch (event.code) {
    case 'ArrowDown':
      refs.movement.y -= stepSize;
      break;
    case 'ArrowUp':
      refs.movement.y += stepSize;
      break;
    case 'ArrowLeft':
      refs.movement.x += stepSize;
      break;
    case 'ArrowRight':
      refs.movement.x -= stepSize;
      break;
  }
}

const update = (refs: GameRefs) => () => {
  if (refs.map !== undefined) {
    const { x, y } = refs.movement;
    refs.map.panBy(x, y);
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
      player: undefined,
      updateLoop: undefined,
      movement: { x: 0, y: 0 },
    };
    return {
      onMapMounted: () => (ref: GoogleMap) => {
        refs.map = ref;
        window.addEventListener('keydown', onKeyDown(refs));
        window.addEventListener('keyup', onKeyUp(refs));
        refs.updateLoop = setInterval(update(refs), 50);
      }
    }
  })
)((props: any) => (
  <GoogleMap
    zoom={20}
    defaultCenter={{ lat: 40.76784, lng: -73.963901 }}
    clickableIcons={false}
    ref={props.onMapMounted}
    options={{
      keyboardShortcuts: false,
      disableDefaultUI: true,
      gestureHandling: 'none'
    }} />
));

export default Map;
