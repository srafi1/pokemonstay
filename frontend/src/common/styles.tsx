import { makeStyles, createStyles } from '@material-ui/core';

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
  }
}));
