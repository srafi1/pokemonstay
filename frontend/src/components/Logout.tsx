import React from 'react';
import { withRouter } from 'react-router-dom';
import { CircularProgress, ThemeProvider, Box } from '@material-ui/core';
import theme from '../common/theme';
import logo from '../assets/logo.png';

function Logout(props: any) {
  fetch('/api/logout')
  .then((res: Response) => {
    if (res.status === 200) {
      props.history.push('/login');
    }
  })
  return (
    <ThemeProvider theme={theme}>
      <Box
        bgcolor="background.default"
        height={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center">
        <img src={logo} width={600} alt="Pokemon Stay" />
        <CircularProgress />
      </Box>
    </ThemeProvider>
  ); 
}

export default withRouter(Logout);
