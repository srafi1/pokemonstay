import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  ThemeProvider,
  Typography
} from '@material-ui/core';
import theme from '../common/theme';
import pokeball from '../assets/pokeball.png';

function PostEncounterDialog(props: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [caught, setCaught] = useState(true);
  props.setRefs(setIsOpen, setCaught);
  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{style: {backgroundColor: theme.palette.background.default}}}
        maxWidth={false}
        style={{textAlign: "center"}}>
        <DialogContent>
          <Typography variant="h4">
            {caught ? 'You caught the pokemon!' :
            'The pokemon ran away!'}
          </Typography>
          {caught &&
            <img width={100} src={pokeball} alt="Pokeball" />
          }
          <br />
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

export default PostEncounterDialog;
