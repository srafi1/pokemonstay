import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
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
import menuOpenIcon from '../assets/pokeball_icon.svg';
import profile from '../assets/profile.png';
import pokeballIcon from '../assets/pokeball_icon.png';
import pokedex from '../assets/pokedex.png';
import help from '../assets/help.png';
import logout from '../assets/logout.png';
import HelpDialog from './HelpDialog';

const MENU_ICON_SIZE = 80;
const useStyles = makeStyles({
  menuCenter: {
    position: "absolute",
    left: "50%",
    marginLeft: MENU_ICON_SIZE / -2,
    top: "100%",
    marginTop: MENU_ICON_SIZE * -1.5,
  },
  menuButton: {
    width: MENU_ICON_SIZE,
    height: MENU_ICON_SIZE,
  },
  svgIcon: {
    position: "absolute",
    top: "15%",
    left: "15%",
    height: '70%',
  },
});

function GameMenu(props: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const styles = commonStyles();
  const menuStyles = useStyles();
  const helpShown = localStorage.getItem('helpShown');
  if (helpShown === null) {
    setHelpOpen(true);
    localStorage.setItem('helpShown', "yes");
  }
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
          <img src={logo} className={styles.logo} alt="Logo" />
          <Box
            display="flex"
            alignItems="start"
            flexDirection="column">
            <MenuComponent
              image={profile}
              text="Profile"
              onClick={() => props.history.push('/profile')} />
            <MenuComponent
              image={pokeballIcon}
              text="Pokemon"
              onClick={() => props.history.push('/pokemon')} />
            <MenuComponent
              image={pokedex}
              text="Pokedex"
              onClick={() => props.history.push('/pokedex')} />
            <MenuComponent
              image={help}
              text="Help"
              onClick={() => setHelpOpen(true)} />
            <MenuComponent
              image={logout}
              text="Logout"
              onClick={() => props.history.push('/logout')} />
          </Box>
        </Box>
      </Fade>
      <Box className={menuStyles.menuCenter}>
        <Fab
          color="secondary"
          size="medium"
          classes={{sizeMedium:menuStyles.menuButton}}
          onKeyUp={(e) => e.preventDefault()}
          onKeyPress={(e) => e.preventDefault()}
          onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 
            <CloseIcon fontSize="large" /> :
            <Icon>
              <img
                src={menuOpenIcon}
                alt="MENU"
                className={menuStyles.svgIcon} />
            </Icon>
          }
        </Fab>
      </Box>
      <HelpDialog open={helpOpen} close={() => setHelpOpen(false)} />
    </ThemeProvider>
  );
}

export default withRouter(GameMenu);
