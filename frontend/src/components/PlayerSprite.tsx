import React, {useState, useEffect} from 'react';
import { makeStyles, createStyles } from '@material-ui/core';
import standing from '../assets/player_standing.png';
import running from '../assets/player_running.gif';

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 60;

const useStyles = makeStyles(() => createStyles({
  absoluteCenter: {
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    position: "absolute",
    left: "50%",
    marginLeft: PLAYER_WIDTH / -2,
    top: "50%",
    marginTop: PLAYER_HEIGHT / -2,
    zIndex: 1,
  }
}))

function PlayerSprite(props: {onMount: Function}) {
  const [isStanding, setIsStanding] = useState(true);
  useEffect(() => {
    props.onMount(setIsStanding);
  }, [ props, setIsStanding ])
  const styles = useStyles(); 
  return (
    <img
      alt=""
      className={styles.absoluteCenter}
      src={isStanding ? standing : running} />
  );
}

export default PlayerSprite;
