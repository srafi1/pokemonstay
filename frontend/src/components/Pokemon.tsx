import React from 'react';
import { Box, ThemeProvider } from '@material-ui/core';
import theme from '../common/theme';
import Header from './Header';

function Pokemon() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        minHeight={1}
        bgcolor="background.default"
        color="text.primary"
        display="flex"
        flexDirection="column"
        alignItems="center">
        <Header page="Pokemon" />
      </Box>
    </ThemeProvider>
  );
}

export default Pokemon;

