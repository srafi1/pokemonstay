import React from 'react';
import { Box } from '@material-ui/core';
import { GoogleMap, withScriptjs, withGoogleMap } from 'react-google-maps';
import { compose, withProps } from 'recompose';
import Loading from './Loading';

const Map = compose(
  withProps({
    googleMapURL:
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyAC4hh69r1rQ-rCtDZ8muFywZQFKp3_ZsM&v=3.exp",
    loadingElement: Loading,
    containerElement: <Box height={1} />,
    mapElement: <Box height={1} />
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <GoogleMap
    defaultZoom={20}
    defaultCenter={{ lat: 40.76784, lng: -73.963901 }} />
));

export default Map;
