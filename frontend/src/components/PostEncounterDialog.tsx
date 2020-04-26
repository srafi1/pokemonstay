import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  ThemeProvider,
  Typography
} from '@material-ui/core';
import theme from '../common/theme';

function PostEncounterDialog(props: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState();
  props.setRefs(setIsOpen, setMessage);
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
            {message}
          </Typography>
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

export default PostEncounterDialog;
