import React from 'react';
import PropTypes from 'prop-types';

import Autocomplete from '@material-ui/lab/Autocomplete';

import {
  FormControl, Input, TextField,
  Select, MenuItem, ListItemText,
} from '@material-ui/core';

import CustomPropTypes from './CustomPropTypes.js';

export function BasicCell({value}) {
  if (value === null || value === undefined) {
    return '';
  }
  return value;
}

//TODO: Speed up feedback loop here
export function EditCellText({value, row, column}) {
  if (!row.state.editing) {
    return value
  }

  let editValue = row.state.values[column.id];
  if (editValue === null || editValue === undefined) {
    editValue = '';
  }

  const onChange = e => {
    const newVal = e.target.value;  // New variable because of event pooling
    row.setState(currentState =>
      ({ ...currentState, values: { ...currentState.values, [column.id]: newVal}})
    );
  };

  return (
    <FormControl style={{ width: "100%" }}>
      <Input value={editValue} onChange={onChange} />
    </FormControl>
  );
}

export function EditCellSelect(choices, {value, row, column}) {
  if (!row.state.editing) {
    return value || null
  }

  let editValue = row.state.values[column.id];
  if (editValue === null || editValue === undefined) {
    editValue = '';
  }

  const onChange = e => {
    const newVal = e.target.value;  // New variable because of event pooling
    row.setState(currentState =>
      ({ ...currentState, values: { ...currentState.values, [column.id]: newVal}})
    );
  };

  return (
    <FormControl style={{ width: "100%" }}>
      <Select value={editValue} onChange={onChange}>
        {choices.map((choice, index) =>
          <MenuItem key={index} value={choice.id}>
            <ListItemText primary={choice.name} />
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

// TODO: Refactor this and PriorityEditIndividual together
export function OldEditItemAutocomplete(props) {
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

OldEditItemAutocomplete.propTypes = {
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
