import React from 'react';

import { styled } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';

import { classes, roles } from './Constants.js'

const LoginButton = styled(Button)({
  'margin-left': 'auto',
  'margin-right': '24px',
});

const SignupButton = styled(Button)({
  'margin-right': '24px',
});

const PaddedTextField = styled(TextField)({
  'margin-bottom': '20px',
  'margin-right': '20px',
});

const PaddedSelect = styled(Select)({
  'margin-bottom': '20px',
  'margin-right': '20px',
});

export function LoginDialog() {
  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [usernameError, setUsernameError] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setUsernameError(false);
    setPasswordError(false);
    setOpen(false);
  };

  //TODO - hook up to API
  const handleSubmit = () => {
    if (username === '') {
      setUsernameError(true);
    }
    
    if (password === '') {
      setPasswordError(true);
    }

    if (username !== '' && password !== '') {
      setOpen(false);
    }
  };

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
    setUsernameError(false);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    setPasswordError(false);
  }

  return (
    <>
      <LoginButton color="inherit" onClick={handleClickOpen}>Login</LoginButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="login-dialog-title">Login</DialogTitle>
        <DialogContent>
          <PaddedTextField error={usernameError} label="Character Name" variant="filled"
                           value={username} onChange={handleChangeUsername} />
          <br />
          <PaddedTextField error={passwordError} label="Password" variant="filled" type="password"
                           value={password} onChange={handleChangePassword} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">Login</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


export function SignupDialog(props) {
  const [open, setOpen] = React.useState(false);
  const [playerId, setPlayerId] = React.useState(0);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [usernameError, setUsernameError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [password2Error, setPassword2Error] = React.useState(false);
  const [passwordErrorText, setPasswordErrorText] = React.useState('');
  const [playerClass, setPlayerClass] = React.useState(classes[0]);
  const [playerRole, setPlayerRole] = React.useState('DPS');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setUsernameError(false);
    setPasswordError(false);
    setPassword2Error(false);
    setPasswordErrorText('');
    setOpen(false);
  };

  //TODO - hook up to API
  const handleSubmit = () => {
    var hasError = false;

    if (playerId === 0 && username === '') {
      hasError = true;
      setUsernameError(true);
    }
    
    if (password === '') {
      hasError = true;
      setPasswordError(true);
    }

    if (password2 === '') {
      hasError = true;
      setPassword2Error(true);
    }

    if (password !== password2) {
      hasError = true;
      setPasswordError(true);
      setPassword2Error(true);
      setPasswordErrorText('Passwords Must Match');
    }

    if (!hasError) {
      setOpen(false);
    }
  };

  const handlePlayerIdChange = (e) => {
    setPlayerId(e.target.value);
  }

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
    setUsernameError(false);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    setPasswordError(false);
    setPasswordErrorText('');
  }

  const handleChangePassword2 = (e) => {
    setPassword2(e.target.value);
    setPassword2Error(false);
    setPasswordErrorText('');
  }

  const handlePlayerClassChange = (e) => {
    setPlayerClass(e.target.value);
  }

  const handlePlayerRoleChange = (e) => {
    setPlayerRole(e.target.value);
  }

  const players = props.players;
  players.sort((a, b) => (a.name > b.name) ? 1 : -1);

  const newCharacterFields = (
    <>
      <br />
      <PaddedTextField error={usernameError} label="Character Name" variant="filled"
                       value={username} onChange={handleChangeUsername} />
      <FormControl variant="filled">
        <InputLabel id="class-select-label">Class</InputLabel>
        <PaddedSelect labelId="class-select-label" value={playerClass} onChange={handlePlayerClassChange}>
          {classes.map((className, index) =>
            <MenuItem value={className} key={index}>{className}</MenuItem>
          )}
        </PaddedSelect>
      </FormControl>
      <FormControl variant="filled">
        <InputLabel id="role-select-label">Role</InputLabel>
        <PaddedSelect labelId="role-select-label" value={playerRole} onChange={handlePlayerRoleChange}>
          {roles.map((role, index) =>
            <MenuItem value={role} key={index}>{role}</MenuItem>
          )}
        </PaddedSelect>
      </FormControl>
    </>
  );

  return (
    <>
      <SignupButton color="inherit" onClick={handleClickOpen}>Signup</SignupButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="signup-dialog-title">Sign Up</DialogTitle>
        <DialogContent>
          <FormControl variant="filled">
            <InputLabel id="player-select-label">Character</InputLabel>
            <PaddedSelect labelId="player-select-label" value={playerId} onChange={handlePlayerIdChange}>
              <MenuItem value={0}>New Character</MenuItem>
              {players.map((player) =>
                <MenuItem value={player.id} key={player.id}>{player.name}</MenuItem>
              )}
            </PaddedSelect>
          </FormControl>
          { playerId === 0 ? newCharacterFields : '' }
          <br />
          <PaddedTextField error={passwordError} label="Password" variant="filled" type="password"
                           value={password} onChange={handleChangePassword} />
          <PaddedTextField error={password2Error} label="Confirm Password" variant="filled" type="password"
                           value={password2} onChange={handleChangePassword2} helperText={passwordErrorText} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">Sign Up</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
