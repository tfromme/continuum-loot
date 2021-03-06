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

BasicCell.propTypes = {
  value: PropTypes.node,
}

export function EditCellText({value, row, column}) {
  const [editValue, setEditValue] = React.useState(value);

  const onChange = e => {
    setEditValue(e.target.value);
  }

  const onBlur = () => {
    row.setState(currentState =>
      ({ ...currentState, values: { ...currentState.values, [column.id]: editValue}})
    );
  };

  if (!row.state.editing) {
    return value
  }

  return (
    <FormControl style={{ width: "100%" }}>
      <Input value={editValue || ''} onChange={onChange} onBlur={onBlur} />
    </FormControl>
  );
}

EditCellText.propTypes = {
  value: PropTypes.node,
  row: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
}

export function EditCellAutocomplete(choices, {value, row, column}) {
  const [inputValue, setInputValue] = React.useState('')
  const [editValue, setEditValue] = React.useState(choices.find(c => c.name === value))

  const onChange = React.useCallback(
    (e, newVal) => {
      setEditValue(newVal);
      row.setState(currentState =>
        ({ ...currentState, values: { ...currentState.values, [column.id]: newVal.id}})
      );
    },
    [row, column.id],
  );

  if (!row.state.editing) {
    return value || null
  }

  return (
    <Autocomplete
      options={choices}
      getOptionLabel={option => option.name}
      value={editValue}
      onChange={onChange}
      inputValue={inputValue}
      onInputChange={(e, newInputVal) => { setInputValue(newInputVal); }}
      renderInput={params => <TextField {...params} />}
      disableClearable
    />
  );
}

export function EditCellSelect(choices, {value, row, column}) {
  const onChange = React.useCallback(
    e => {
      const newVal = e.target.value;  // New variable because of event pooling
      row.setState(currentState =>
        ({ ...currentState, values: { ...currentState.values, [column.id]: newVal}})
      );
    },
    [row, column.id],
  );

  if (!row.state.editing) {
    return (value || value === 0) ? value : null
  }

  let editValue = row.state.values[column.id];
  if (editValue === null || editValue === undefined) {
    editValue = '';
  }

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
