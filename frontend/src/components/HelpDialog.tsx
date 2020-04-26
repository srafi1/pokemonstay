import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  ThemeProvider,
  Typography,
  DialogTitle,
  Box
} from '@material-ui/core';
import theme from '../common/theme';

function HelpDialog(props: any) {
  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={props.open}
        PaperProps={{style: {backgroundColor: theme.palette.background.default}}}
        maxWidth={false}
        onClose={props.close}
        style={{textAlign: "center"}}>
        <DialogTitle>
          Help
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Run around with WASD or the arrow keys. <br />
            Find Pokemon that spawn around you. <br />
            Click on a Pokemon to try to catch it. <br />
          </Typography>
          <Box mt={3}>
            <Button variant="outlined" onClick={props.close}>
            Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

export default HelpDialog;
