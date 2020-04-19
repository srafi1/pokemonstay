import React, {useState, useEffect} from 'react';
import { commonStyles } from '../common/styles';
import standing from '../assets/player_standing.png';
import running from '../assets/player_running.gif';

function PlayerSprite(props: {onMount: Function}) {
  const [isStanding, setIsStanding] = useState(true);
  const styles = commonStyles();
  useEffect(() => {
    props.onMount(setIsStanding);
  }, [ props, setIsStanding ])
  return (
    <img
      alt=""
      className={styles.playerCenter}
      src={isStanding ? standing : running} />
  );
}

export default PlayerSprite;
