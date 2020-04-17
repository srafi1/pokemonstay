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
import { Link as RouterLink } from 'react-router-dom';
import logo from '../assets/logo.png';

const registerSubmit = (
  credentials: { username: string, password: string, confirmPassword: string },
  setErrors: Function,
  setErrorMsg: Function) => (event: React.FormEvent) => {
  event.preventDefault();
  let errors = {username: false, password: false, confirmPassword: false};
  if (!credentials.username || credentials.username === '') {
    errors.username = true;
  }
  if (!credentials.password || credentials.password === '') {
    errors.password = true;
  }
  if (!credentials.confirmPassword || credentials.confirmPassword === '') {
    errors.confirmPassword = true;
  }
  setErrors(errors);
  if (!errors.username && !errors.password && !errors.confirmPassword) {
    console.log('submitted');
    setErrorMsg('');
  } else {
    setErrorMsg('Please fill in all fields');
  }
}

function Register(props: any) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    username: false,
    password: false,
    confirmPassword: false,
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
        <h1>Register</h1>
        {errorText}
        <form onSubmit={registerSubmit(credentials, setErrors, setErrorMsg)}>
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
            <TextField
              error={errors.confirmPassword}
              className={styles.whiteInput}
              onChange={credentialChange}
              type="password"
              name="confirmPassword"
              label="Confirm Password" />
            <Button
              type="submit"
              variant="contained"
              color="secondary">
              Register
            </Button>
          </Box>
        </form>
        <Box padding={1}>
          <Link color="textPrimary" component={RouterLink} to="/login">
            or login here
          </Link>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Register;

