import { makeStyles, createStyles } from '@material-ui/core';

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 60;
const MENU_ICON_SIZE = 80;

export const commonStyles = makeStyles(() => createStyles({
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
  menuCenter: {
    width: MENU_ICON_SIZE,
    height: MENU_ICON_SIZE,
    position: "absolute",
    left: "50%",
    marginLeft: MENU_ICON_SIZE / -2,
    top: "100%",
    marginTop: MENU_ICON_SIZE * -2,
  },
}));
