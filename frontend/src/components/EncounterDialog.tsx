import React, { MouseEvent, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  ThemeProvider,
  Typography,
} from '@material-ui/core';
import encounterBG from '../assets/encounter.png';
import trainerImg from '../assets/trainer_back.png';
import pokeballImg from '../assets/pokeball.png';
import { withHandlers } from 'recompose';
import theme from '../common/theme';

const POKEBALL_SIZE = 50;
const POKEMON_SIZE = 200;

interface MovingSprite {
  sprite: HTMLImageElement,
  width: number,
  height: number,
  x: number,
  y: number,
  dx: number,
  dy: number,
}

interface EncounterRefs {
  numPokeballs: number,
  ctx: CanvasRenderingContext2D | null,
  trainer: HTMLImageElement,
  bg: HTMLImageElement,
  pokemon: MovingSprite,
  pokeball: MovingSprite,
  ballDest: {
    x: number,
    y: number,
  },
  ballThrown: boolean,
  updateLoop: NodeJS.Timeout | undefined,
  caught: Function,
}

function dist(x1: number, y1: number, x2: number, y2: number):number {
  return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}

const update = (refs: EncounterRefs) => () => {
  if (refs.ctx) {
    // update positions
    let { x, y } = refs.pokemon;
    if (x < 450 || x > 650) {
      refs.pokemon.dx *= -1;
      refs.pokemon.x += refs.pokemon.dx;
    }
    if (y < 150 || y > 300) {
      refs.pokemon.dy *= -1;
      refs.pokemon.y += refs.pokemon.dy;
    }
    refs.pokemon.dx += 0.6*Math.random()-0.3;
    refs.pokemon.dy += 0.6*Math.random()-0.3;
    refs.pokemon.dx = Math.min(refs.pokemon.dx, 2);
    refs.pokemon.dy = Math.min(refs.pokemon.dy, 2);
    refs.pokemon.x += refs.pokemon.dx;
    refs.pokemon.y += refs.pokemon.dy;

    if (refs.ballThrown) {
      const ball = refs.pokeball;
      ball.x += ball.dx;
      ball.y += ball.dy;
      if (dist(ball.x, ball.y, refs.ballDest.x, refs.ballDest.y) < 10) {
        refs.ballThrown = false;
        const distToPokemon = dist(
          ball.x,
          ball.y,
          refs.pokemon.x,
          refs.pokemon.y
        );
        if (distToPokemon < 50) {
          refs.caught(true);
        } else {
          if (refs.numPokeballs === 0) {
            refs.caught(false);
          }
        }
        ball.x = 220;
        ball.y = 300;
      }
    }

    // draw
    refs.ctx.drawImage(refs.bg, 0, 0);
    refs.ctx.drawImage(refs.trainer, -50, 100);
    let sprite, width, height;
    ({ sprite, x, y, width, height } = refs.pokemon);
    refs.ctx.drawImage(sprite, x-width/2, y-height/2, width, height);
    ({ sprite, x, y, width, height } = refs.pokeball);
    if (refs.ballThrown) {
      refs.ctx.drawImage(sprite, x-width/2, y-height/2, width, height);
    }
    for (let i = 0; i < refs.numPokeballs; i++) {
      refs.ctx.drawImage(sprite, 300 + 60*i, 400, width, height);
    }
  }
}

const withEncounterHandlers = withHandlers(() => {
  const bg = new Image();
  bg.src = encounterBG;
  const trainer = new Image();
  trainer.src = trainerImg;
  const pokeball = new Image(POKEBALL_SIZE, POKEBALL_SIZE);
  pokeball.src = pokeballImg;
  const pokemon = new Image(POKEMON_SIZE, POKEMON_SIZE);
  const refs: EncounterRefs = {
    numPokeballs: 3,
    ctx: null,
    bg: bg,
    trainer: trainer,
    pokemon: {
      sprite: pokemon,
      width: POKEMON_SIZE,
      height: POKEMON_SIZE,
      x: 0,
      y: 0,
      dx: 2*Math.random()-1,
      dy: 2*Math.random()-1,
    },
    pokeball: {
      sprite: pokeball,
      width: POKEBALL_SIZE,
      height: POKEBALL_SIZE,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
    },
    ballDest: {
      x: 0,
      y: 0,
    },
    ballThrown: false,
    updateLoop: undefined,
    caught: () => {},
  }

  return {
    onEncounter: () => (dex: number, completeFunc: Function) => {
      refs.pokemon.sprite.src = `/api/sprite?dex=${dex}`;
      refs.caught = completeFunc;
    },
    onCanvasMount: () => (ref: HTMLCanvasElement) => {
      if (ref) {
        refs.ctx = ref.getContext('2d');
        refs.numPokeballs = 3;
        let dx =  2*Math.random()-1;
        if (dx > 0) {
          dx += 1;
        } else {
          dx -= 1;
        }
        let dy =  2*Math.random()-1;
        if (dy > 0) {
          dy += 1;
        } else {
          dy -= 1;
        }
        refs.pokemon.x = 500;
        refs.pokemon.y = 200;
        refs.pokemon.dx = dx;
        refs.pokemon.dy = dy;
        refs.pokeball.x = 220;
        refs.pokeball.y = 300;
        refs.updateLoop = setInterval(update(refs), 17);
      } else if (refs.updateLoop) {
        refs.pokemon.sprite.src = '';
        clearInterval(refs.updateLoop);
      }
    },
    onClick: () => (event: MouseEvent<HTMLCanvasElement>) => {
      if (!refs.ballThrown && refs.numPokeballs > 0) {
        refs.ballThrown = true;
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.pageX - rect.x;
        const mouseY = event.pageY - rect.y;
        refs.pokeball.dx = (mouseX - refs.pokeball.x) / 40;
        refs.pokeball.dy = (mouseY - refs.pokeball.y) / 40;
        refs.numPokeballs--;
        refs.ballDest.x = mouseX;
        refs.ballDest.y = mouseY;
      }
    },
  }
});

function EncounterDialog(props: any) {
  useEffect(() => {
    if (props.encounter.active) {
      props.onEncounter(props.encounter.pokemon.dex, props.complete);
    }
  }, [props.encounter.active]);
  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={props.encounter.active}
        PaperProps={{style: {backgroundColor: theme.palette.background.default}}}
        maxWidth={false}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}>
        <DialogTitle>You've encountered a Pokemon!</DialogTitle>
        <DialogContent>
          {props.encounter.active ?
            <canvas
              width={800}
              height={480}
              onClick={props.onClick}
              ref={props.onCanvasMount} /> : null
          }
          <Typography variant="subtitle1" style={{textAlign: "center"}}>
            Click to throw a pokeball.
          </Typography>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

export default withEncounterHandlers(EncounterDialog);
