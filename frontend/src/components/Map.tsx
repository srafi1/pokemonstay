import React from 'react';
import { Box } from '@material-ui/core';
import { GoogleMap, withScriptjs, withGoogleMap } from 'react-google-maps';
import { compose, withProps } from 'recompose';
import Loading from './Loading';

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
  withGoogleMap
)(props => (
  <GoogleMap
    zoom={20}
    defaultCenter={{ lat: 40.76784, lng: -73.963901 }}
    clickableIcons={false}
    options={{
      keyboardShortcuts: false,
      disableDefaultUI: true,
      gestureHandling: 'none'
    }} />
));

export default Map;
