import React, { useState } from 'react';
import {
  Box,
  Fab,
  ThemeProvider,
  Fade,
  Icon,
  makeStyles,
} from '@material-ui/core';
import theme from '../common/theme';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { commonStyles } from '../common/styles';
import pokeball from '../assets/pokeball.svg';

const useStyles = makeStyles({
  svgIcon: {
    position: "absolute",
    top: "15%",
    left: "15%",
    height: '70%',
  },
  iconRoot: {
    textAlign: 'center',
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
          MENU OPEN
        </Box>
      </Fade>
      <Fab
        className={styles.menuCenter}
        color="secondary"
        onClick={() => setIsOpen(!isOpen)}>
        <Icon className={pokeballStyles.iconRoot}>
          <img
            src={pokeball}
            alt="MENU"
            className={pokeballStyles.svgIcon} />
        </Icon>
      </Fab>
    </ThemeProvider>
  )
}

export default GameMenu;
