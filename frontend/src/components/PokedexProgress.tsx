import React from 'react';
import { Box, Typography } from '@material-ui/core';
import LargeProgress from './LargeProgress';

function PokedexProgress(props: any) {
  return (
    <Box p={2} display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
      <Box pr={2} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h6">
          Encountered:
        </Typography>
        <LargeProgress value={props.totalEnc} total={props.total} />
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h6">
          Caught:
        </Typography>
        <LargeProgress value={props.totalCaught} total={props.total} />
      </Box>
    </Box>
  );
}
export default PokedexProgress;
