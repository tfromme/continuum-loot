import React from 'react';
import PropTypes from 'prop-types';

import { styled } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Alert from '@material-ui/lab/Alert';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';

export const LeftPaddedButton = styled(Button)({
  'margin-left': 'auto',
  'margin-right': '24px',
});

export const StyledButton = styled(Button)({
  'margin-right': '24px',
});

export const PaddedTextField = styled(TextField)({
  'margin-bottom': '20px',
  'margin-right': '20px',
});

export const PaddedSelect = styled(Select)({
  'margin-bottom': '20px',
  'margin-right': '20px',
});

export function SubmissionDialog(props) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    props.onClose();
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!props.error) {
      props.onSubmit().then(() => {
        handleClose();
      });
    }
  };

  const MyButton = props.leftPadded ? LeftPaddedButton : StyledButton;

  return (
    <>
      <MyButton color="inherit" onClick={handleClickOpen}>{props.buttonText}</MyButton>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent>
          {props.children}
        </DialogContent>
        <Collapse in={props.error}>
          <Alert severity="error">
            {props.errorMessage}
          </Alert>
        </Collapse>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">{props.submitButtonText}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

SubmissionDialog.propTypes = {
  buttonText: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  submitButtonText: PropTypes.string,
  leftPadded: PropTypes.bool,
  children: PropTypes.node,
}

SubmissionDialog.defaultProps = {
  onClose: () => null,
  onSubmit: () => (new Promise(() => null)),
  error: false,
  errorMessage: 'Invalid Input',
  submitButtonText: 'Submit',
  leftPadded: false,
  children: null,
}
