import React from 'react';
import { Box, Link, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { commonStyles } from '../common/styles';

function NavItem(props: any) {
  const styles = commonStyles();
  const color = props.current === props.text ? "error" : "primary";
  return (
    <Link component={RouterLink} to={props.to}>
      <Box
        className={styles.menuItem}
        p={1}
        ml={1}
        mr={1}
        textAlign="center">
        <Typography variant="button" display="block" color={color}>
          {props.text}
        </Typography>
        <img src={props.icon} width={40} alt="icon" />
      </Box>
    </Link>
  );
}
export default NavItem;
