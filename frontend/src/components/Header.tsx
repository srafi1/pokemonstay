import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { commonStyles } from '../common/styles';
import NavItem from './NavItem';
import logo from '../assets/logo.png';
import map from '../assets/map.png';
import profile from '../assets/profile.png';
import pokeballIcon from '../assets/pokeball_icon.png';
import pokedex from '../assets/pokedex.png';
import logout from '../assets/logout.png';

function Header(props: any) {
  const styles = commonStyles();
  return (
    <Box
      pt={5}
      width={1}
      display="flex"
      flexDirection="column"
      alignItems="center">
      <img src={logo} className={styles.logo} alt="Pokemon Stay" />
      <Box
        pb={3}
        display="flex"
        flexDirection="row">
        <NavItem
          text="Explore"
          to="/map"
          current={props.page}
          icon={map}/>
        <NavItem
          text="Profile"
          to="/profile"
          current={props.page}
          icon={profile}/>
        <NavItem
          text="Pokemon"
          to="/pokemon"
          current={props.page}
          icon={pokeballIcon}/>
        <NavItem
          text="Pokedex"
          to="/pokedex"
          current={props.page}
          icon={pokedex}/>
        <NavItem
          text="logout"
          to="/logout"
          current={props.page}
          icon={logout}/>
      </Box>
      <Typography variant="h3" color="error" align="center">
        {props.page}
      </Typography>
    </Box>
  );
}
export default Header;
