import React, { MouseEvent } from 'react';
import { Box, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  menuItem: {
    cursor: 'pointer',
    '&:hover': {
      color: '#CCCCCC',
    },
  },
})

function MenuComponent(props: {
  image: string,
  text: string,
  onClick: (event: MouseEvent) => void,
}) {
  const styles = useStyles();
  return (
    <Box
      m={1}
      onClick={props.onClick}
      display="flex"
      flexDirection="row"
      alignItems="center"
      className={styles.menuItem}>
      <img alt="icon" src={props.image} width={50} />
      <Box p={1}>
        <Typography variant="h4">{props.text}</Typography>
      </Box>
    </Box>
  );
}

export default MenuComponent;
