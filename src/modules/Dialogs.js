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

const LoginButton = styled(Button)({
  'margin-left': 'auto',
  'margin-right': '24px',
});

const SignupButton = styled(Button)({
  'margin-right': '24px',
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
          <TextField error={usernameError} label="Player Name" variant="filled" value={username} onChange={handleChangeUsername} />
          <br />
          <br />
          <TextField error={passwordError} label="Password" variant="filled" type="password" value={password} onChange={handleChangePassword} />
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
  const [playerId, setPlayerId] = React.useState(null);
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
  }

  const players = props.players;
  players.sort((a, b) => (a.name > b.name) ? 1 : -1);


  const playerOptions = players.map((player) =>
    <MenuItem value={player.id} key={player.id}>{player.name}</MenuItem>
  );

  return (
    <>
      <SignupButton color="inherit" onClick={handleClickOpen}>Signup</SignupButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="signup-dialog-title">Sign Up</DialogTitle>
        <DialogContent>
          <FormControl variant="filled">
            <InputLabel id="player-select-label">Character</InputLabel>
            <Select labelId="player-select-label" value={playerId} onChange={handlePlayerIdChange}>
              <MenuItem value={0}>New Character</MenuItem>
              {playerOptions}
            </Select>
            <br />
            <br />
            <TextField error={passwordError} label="Password" variant="filled" type="password" value={password} onChange={handleChangePassword} />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">Sign Up</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
