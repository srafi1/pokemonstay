import React from 'react';
import { Box, ThemeProvider } from '@material-ui/core';
import theme from '../common/theme';
import Header from './Header';

function Pokemon() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        bgcolor="background.default"
        color="text.primary"
        height={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center">
        <Header page="Pokemon" />
      </Box>
    </ThemeProvider>
  );
}

export default Pokemon;

