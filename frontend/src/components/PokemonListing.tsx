import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { commonStyles } from '../common/styles';

function capitalize(s: string):string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function PokemonListing(props: {
  dex: number,
  showDex: boolean,
  silhouette: boolean,
  hidden: boolean,
  name: string,
  onClick?: (event: React.MouseEvent) => void,
}) {
  const styles = commonStyles();
  let imgSrc;
  if (props.hidden) {
    imgSrc = "/api/sprite?dex=0";
  } else if (props.silhouette) {
    imgSrc = `/api/sprite?dex=${props.dex}&silhouette`;
  } else {
    imgSrc = `/api/sprite?dex=${props.dex}`;
  }
  return (
    <Box
      p={1}
      m={1}
      border="1px solid white"
      className={props.onClick !== undefined ? styles.pointer : undefined}
      onClick={props.onClick}
      borderRadius={10}>
      <img src={imgSrc} width={200} alt="0" />
        <Typography variant="body1" align="center">
        {props.showDex && `${props.dex} `}
        {capitalize(`${props.name}`)}
        </Typography>
    </Box>
  );
}
export default PokemonListing;
