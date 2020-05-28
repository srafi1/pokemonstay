import React from 'react';
import Box from '@material-ui/core/Box';

function CenteredBox(props: any) {
  return (
    <Box
    top={0}
    left={0}
    bottom={0}
    right={0}
    position="absolute"
    display="flex"
    alignItems="center"
    justifyContent="center">
      {props.children}
    </Box>
  );
}
export default CenteredBox;
