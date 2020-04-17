import React, { useState } from 'react';
import {
  Box,
  Button,
  Link,
  ThemeProvider,
  TextField,
  Typography,
} from '@material-ui/core';
import theme from '../common/theme';
import { commonStyles } from '../common/styles';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import logo from '../assets/logo.png';

const loginSubmit = (
  credentials: { username: string, password: string },
  setErrors: Function,
  setErrorMsg: Function,
  history: any) => (event: React.FormEvent) => {
  event.preventDefault();
  let errors = {username: false, password: false};
  if (!credentials.username || credentials.username === '') {
    errors.username = true;
  }
  if (!credentials.password || credentials.password === '') {
    errors.password = true;
  }
  setErrors(errors);
  if (!errors.username && !errors.password) {
    fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      credentials: 'same-origin',
    })
    .then(((res: Response) => {
      if (res.status !== 200) {
        setErrorMsg('Failed to login');
      } else {
        history.push('/map');
      }
    }));
    setErrorMsg('');
  } else {
    setErrorMsg('Please fill in all fields');
  }
}

function Login(props: any) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    username: false,
    password: false,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const credentialChange = (event: any) => {
    let ret: any = {...credentials};
    ret[event.currentTarget.name] = event.currentTarget.value;
    setCredentials(ret);
  }
  const styles = commonStyles(props);

  const errorText = errorMsg !== '' ? (
    <Typography color="error">
      {errorMsg}
    </Typography>
  ) : null;

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
        {errorText}
        <form onSubmit={loginSubmit(credentials,
          setErrors,
          setErrorMsg,
          props.history)}>
          <Box
            display="flex"
            flexDirection="column"
            className={styles.childSpacing}>
            <TextField
              autoFocus
              error={errors.username}
              className={styles.whiteInput}
              onChange={credentialChange}
              name="username"
              label="Username" />
            <TextField
              error={errors.password}
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

export default withRouter(Login);
