import React from 'react';
import { Box, Typography } from '@material-ui/core';

function capitalize(s: string):string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PokemonListing(props: {
  dex: number,
  showDex: boolean,
  silhouette: boolean,
  hidden: boolean,
  name: string,
}) {
  return (
    <Box p={1} m={1} border="1px solid white" borderRadius={10}>
      {props.hidden ?
        <img src="/api/sprite?dex=0" width={200} alt="0" /> :
        props.silhouette ?
          <img
            src={`/api/sprite?dex=${props.dex}&silhouette`}
            width={200} alt={`${props.dex}`} /> :
              <img
                src={`/api/sprite?dex=${props.dex}`}
                width={200} alt={`${props.dex}`} />
      }
      <Typography variant="body1" align="center">
        {props.showDex && `${props.dex} `}
        {capitalize(`${props.name}`)}
      </Typography>
    </Box>
  );
}
export default PokemonListing;
