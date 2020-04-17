import React, { useState } from 'react';
import {
  Box,
  Button,
  Link,
  ThemeProvider,
  TextField,
} from '@material-ui/core';
import theme from '../common/theme';
import { commonStyles } from '../common/styles';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../assets/logo.png';

const loginSubmit = (credentials: {
  username: string,
  password: string
}) => (event: React.FormEvent) => {
  event.preventDefault();
  console.log('submitted:', credentials);
}

function Login(props: any) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const credentialChange = (event: any) => {
    let ret: any = {...credentials};
    ret[event.currentTarget.name] = event.currentTarget.value;
    setCredentials(ret);
  }
  const styles = commonStyles(props);

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
        <img src={logo} width={600} alt="Pokemon Stay" />
        <h1>Login</h1>
        <form onSubmit={loginSubmit(credentials)}>
          <Box
            display="flex"
            flexDirection="column"
            className={styles.childSpacing}>
            <TextField
              autoFocus
              className={styles.whiteInput}
              onChange={credentialChange}
              name="username"
              label="Username" />
            <TextField
              className={styles.whiteInput}
              onChange={credentialChange}
              type="password"
              name="password"
              label="Password" />
            <Button
              type="submit"
              variant="contained"
              color="secondary">
              Login
            </Button>
          </Box>
        </form>
        <Box padding={1}>
          <Link color="textPrimary" component={RouterLink} to="/register">
            or register here
          </Link>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Login;

