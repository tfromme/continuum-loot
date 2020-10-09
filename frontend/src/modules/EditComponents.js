import React from 'react';
import PropTypes from 'prop-types';

import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import CustomPropTypes from './CustomPropTypes.js';

// TODO: Refactor this and PriorityEditIndividual together
export function EditItemAutocomplete(props) {
  const [inputValue, setInputValue] = React.useState('');
  const [value, setValue] = React.useState(props.initialValue);
  return (
    <Autocomplete
      options={props.items}
      getOptionLabel={option => option.name}
      value={value}
      onChange={(e, newVal) => { setValue(newVal); props.onChange(newVal ? newVal.id : null); }}
      inputValue={inputValue}
      onInputChange={(e, newInputVal) => { setInputValue(newInputVal); }}
      renderInput={params => <TextField {...params} />}
    />
  );
}

EditItemAutocomplete.propTypes = {
  items: PropTypes.arrayOf(CustomPropTypes.item).isRequired,
  initialValue: CustomPropTypes.item,  // Should be passed in, but can be null/empty
  onChange: PropTypes.func.isRequired,
}

// TODO: Refactor this and EditItemAutocomplete together
export function PriorityEditIndividual(props) {
  const [inputValue, setInputValue] = React.useState('');
  const [value, setValue] = React.useState(props.initialValue);
  return (
    <Autocomplete
      options={props.players}
      getOptionLabel={option => option.name}
      value={value}
      onChange={(e, newVal) => { setValue(newVal); props.onChange(newVal); }}
      inputValue={inputValue}
      onInputChange={(e, newInputVal) => { setInputValue(newInputVal); }}
      renderInput={params => <TextField {...params} />}
    />
  );
}

PriorityEditIndividual.propTypes = {
  initialValue: CustomPropTypes.player,
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
  onChange: PropTypes.func.isRequired,
}
