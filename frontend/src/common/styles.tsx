import { makeStyles, createStyles } from '@material-ui/core';

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 60;

export const commonStyles = makeStyles(() => createStyles({
  logo: {
    maxWidth: "80%",
    width: 500,
  },
  childSpacing: {
    "& *": {
      margin: 5,
    },
  },
  whiteInput: {
    "& *": {
      color: "#FFFFFF",
    }
  },
  playerCenter: {
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    position: "absolute",
    left: "50%",
    marginLeft: PLAYER_WIDTH / -2,
    top: "50%",
    marginTop: PLAYER_HEIGHT / -2,
  },
  menuItem: {
    cursor: 'pointer',
    '&:hover': {
      background: '#FFFFFF22',
    },
  },
  pointer: {
    cursor: 'pointer',
  },
}));
