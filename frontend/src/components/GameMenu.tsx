import React, { useState } from 'react';
import {
  Box,
  Fab,
  ThemeProvider,
  Fade,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import theme from '../common/theme';
import { commonStyles } from '../common/styles';

function GameMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const styles = commonStyles();
  return (
    <ThemeProvider theme={theme}>
      <Fade in={isOpen}>
        <Box
          position="absolute"
          left="0"
          top="0"
          bgcolor="background.default"
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
        <AddIcon />
      </Fab>
    </ThemeProvider>
  )
}

export default GameMenu;
