import React from 'react';
import theme from '../common/theme';
import { ThemeProvider, Dialog, DialogContent, Typography, DialogActions, Button } from '@material-ui/core';
import {withRouter, RouteComponentProps} from 'react-router-dom';

function capitalize(s: string):string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function EvolutionDialog(props: {
  fromDex: number,
  fromName: string,
  toDex: number,
  toName: string,
  close: Function,
} & RouteComponentProps) {
  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={props.fromDex !== 0}
        PaperProps={{style: {backgroundColor: theme.palette.background.default}}}
        style={{textAlign: "center"}}
        maxWidth={false}
        onClose={() => props.close()}>
        <DialogContent>
          <Typography>
            Evolve {capitalize(props.fromName)} into {capitalize(props.toName)}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.close()}>
            No
          </Button>
          <Button onClick={() => {
            fetch(`/api/evolve?from=${props.fromDex}&to=${props.toDex}`)
              .then(() => props.history.go(0))
          }}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
export default withRouter(EvolutionDialog);
