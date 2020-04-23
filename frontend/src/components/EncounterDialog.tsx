import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@material-ui/core';

function EncounterDialog(props: {
  encounter: any,
  complete: Function,
}) {
  const success = () => props.complete(true);
  const failure = () => props.complete(false);
  return (
    <Dialog
      open={props.encounter.active}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}>
      <DialogTitle>You've encountered a Pokemon!</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Did you catch the {props.encounter.active ? props.encounter.pokemon.dex : null}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={failure}>
          No
        </Button>
        <Button onClick={success}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EncounterDialog;
