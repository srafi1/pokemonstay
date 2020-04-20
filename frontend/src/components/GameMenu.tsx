import React, { useState } from 'react';
import {
  Box,
  Fab,
  ThemeProvider,
  Fade,
  Icon,
  makeStyles,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MenuComponent from './MenuComponent';
import theme from '../common/theme';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { commonStyles } from '../common/styles';
import logo from '../assets/logo.png';
import pokeballIcon from '../assets/pokeball_icon.svg';
import profile from '../assets/profile.png';
import pokedex from '../assets/pokedex.png';
import help from '../assets/help.png';
import logout from '../assets/logout.png';

const useStyles = makeStyles({
  svgIcon: {
    position: "absolute",
    top: "15%",
    left: "15%",
    height: '70%',
  },
});

function GameMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const styles = commonStyles();
  const pokeballStyles = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <Fade in={isOpen}>
        <Box
          position="absolute"
          left="0"
          top="0"
          bgcolor={fade(theme.palette.background.default, 0.8)}
          color="text.primary"
          height={1}
          width={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center">
          <img
            src={logo}
            width={400}
            alt="Logo" />
          <Box
            display="flex"
            alignItems="start"
            flexDirection="column">
            <MenuComponent
              image={profile}
              text="Profile"
              onClick={(e) => {console.log('click2')}} />
            <MenuComponent
              image={pokedex}
              text="Pokedex"
              onClick={(e) => {console.log('click')}} />
            <MenuComponent
              image={help}
              text="Help"
              onClick={(e) => {console.log('click')}} />
            <MenuComponent
              image={logout}
              text="Logout"
              onClick={(e) => {console.log('click')}} />
          </Box>
        </Box>
      </Fade>
      <Fab
        className={styles.menuCenter}
        color="secondary"
        onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 
          <CloseIcon fontSize="large" /> :
          <Icon>
            <img
              src={pokeballIcon}
              alt="MENU"
              className={pokeballStyles.svgIcon} />
          </Icon>
        }
      </Fab>
    </ThemeProvider>
  )
}

export default GameMenu;
