import React from 'react';
import { Box, ThemeProvider } from '@material-ui/core';
import theme from '../common/theme';

function Map() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        bgcolor="background.default"
        color="text.primary"
        height={1}>
      </Box>
    </ThemeProvider>
  );
}

export default Map;
