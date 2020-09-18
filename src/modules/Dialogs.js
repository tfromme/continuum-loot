import React from 'react';
import PropTypes from 'prop-types';

import { styled } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Alert from '@material-ui/lab/Alert';
import Collapse from '@material-ui/core/Collapse';

import CustomPropTypes from './CustomPropTypes.js';
import { classes, roles } from './Constants.js';
import { postApi } from './Api.js';

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

export function LogoutDialog(props) {
  const handleClick = () => {
    props.setLoggedInPlayer(null);
    // Don't care if it was successful or not
    fetch('/api/logout');
  };

  return (
    <LoginButton color="inherit" onClick={handleClick}>Logout</LoginButton>
  );
}

LogoutDialog.propTypes = {
  setLoggedInPlayer: PropTypes.func.isRequired,
}

export function LoginDialog(props) {
  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [usernameError, setUsernameError] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('');

  const postLogin = () => {
    var data = {
      'player_name': username,
      'password': password,
    };

    postApi('/api/login', data).then(res => {
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        return res.json;
      }
    }).then(json => {
      if (json) {
        if (json.error) {
          setErrorMessage(json.error);
        } else {
          props.setLoggedInPlayer(json.player);
          handleClose();
        }
      }
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setUsernameError(false);
    setPasswordError(false);
    setErrorMessage('');
    setOpen(false);
  };

  const handleSubmit = () => {
    if (username === '') {
      setUsernameError(true);
    }
    
    if (password === '') {
      setPasswordError(true);
    }

    if (username !== '' && password !== '') {
      postLogin();
    }
  };

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
    setUsernameError(false);
    setErrorMessage('');
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    setPasswordError(false);
    setErrorMessage('');
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
        <Collapse in={errorMessage !== ''}>
          <Alert severity="error">
            {errorMessage}
          </Alert>
        </Collapse>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">Login</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

LoginDialog.propTypes = {
  setLoggedInPlayer: PropTypes.func.isRequired,
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
  const [playerRole, setPlayerRole] = React.useState(roles[0]);
  const [errorMessage, setErrorMessage] = React.useState('');

  const postSignup = () => {
    var data;
    if (playerId === 0) {
      data = {
        'new': true,
        'player_name': username,
        'password': password,
        'class': playerClass,
        'role': playerRole,
      };
    } else {
      data = {
        'new': false,
        'player_id': playerId,
        'password': password,
      }
    }

    postApi('/api/signup', data).then(res => {
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        return res.json;
      }
    }).then(json => {
      if (json) {
        if (json.error) {
          setErrorMessage(json.error);
        } else {
          props.setLoggedInPlayer(json.player);
          props.updateRemoteData('players');
          handleClose();
        }
      }
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setPassword2('');
    setUsernameError(false);
    setPasswordError(false);
    setPassword2Error(false);
    setPasswordErrorText('');
    setErrorMessage('');
    setOpen(false);
  };

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
      postSignup();
    }
  };

  const handlePlayerIdChange = (e) => {
    setPlayerId(e.target.value);
    setErrorMessage('');
  }

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
    setUsernameError(false);
    setErrorMessage('');
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    setPasswordError(false);
    setPasswordErrorText('');
    setErrorMessage('');
  }

  const handleChangePassword2 = (e) => {
    setPassword2(e.target.value);
    setPassword2Error(false);
    setPasswordErrorText('');
    setErrorMessage('');
  }

  const handlePlayerClassChange = (e) => {
    setPlayerClass(e.target.value);
    setErrorMessage('');
  }

  const handlePlayerRoleChange = (e) => {
    setPlayerRole(e.target.value);
    setErrorMessage('');
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
              {players.filter(player => player.rank !== 'Inactive').map(player =>
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
        <Collapse in={errorMessage !== ''}>
          <Alert severity="error">
            {errorMessage}
          </Alert>
        </Collapse>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">Sign Up</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

SignupDialog.propTypes = {
  setLoggedInPlayer: PropTypes.func.isRequired,
  updateRemoteData: PropTypes.func.isRequired,
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
}
