import React from 'react';
import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import CenteredBox from './CenteredBox';

function LargeProgress(props: CircularProgressProps & {
  value: number,
  total: number,
}) {
  const progress = Math.round(props.value / props.total * 100+1);
  return (
    <Box p={3} position="relative" display="flex">
      <CircularProgress
        color="primary"
        variant="static"
        size={200}
        value={100} />
      <CenteredBox>
        <CircularProgress
          color="secondary"
          variant="static"
          size={200}
          value={progress} />
      </CenteredBox>
      <CenteredBox>
        <Typography variant="h6">
          {props.value} / {props.total}
        </Typography>
      </CenteredBox>
    </Box>
  );
}
export default LargeProgress;
