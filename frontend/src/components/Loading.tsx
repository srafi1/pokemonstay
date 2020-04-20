import React from 'react';
import { CircularProgress, ThemeProvider, Box } from '@material-ui/core';
import theme from '../common/theme';
import logo from '../assets/logo.png';
import { commonStyles } from '../common/styles';

function Loading() {
  const styles = commonStyles();
  return (
    <ThemeProvider theme={theme}>
      <Box
        bgcolor="background.default"
        height={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center">
        <img src={logo} className={styles.logo} alt="Pokemon Stay" />
        <CircularProgress />
      </Box>
    </ThemeProvider>
  ); 
}

export default Loading;
