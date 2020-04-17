import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { CircularProgress, ThemeProvider, Box } from '@material-ui/core';
import theme from '../common/theme';
import logo from '../assets/logo.png';

function Unauthenticated(props: any) {
  const [checkAuth, setCheckAuth] = useState(true);
  if (checkAuth) {
    fetch('/api/auth', {
      method: 'POST',
      credentials: 'same-origin',
    })
    .then((res: Response) => {
      setCheckAuth(false);
      if (res.status === 200) {
        props.history.push('/map');
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
  } else {
    return <props.component />;
  }
}

export default withRouter(Unauthenticated);
