import React from 'react';
import PropTypes from 'prop-types';

import {
  TextField, InputAdornment,
  FormControl, Select, MenuItem, Checkbox, ListItemText,
} from '@material-ui/core';

import { FilterList } from '@material-ui/icons';

export function TextFilter({column: { filterValue, setFilter }}) {
  return (
    <TextField
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined)
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <FilterList />
          </InputAdornment>
        ),
      }}
    />
  );
}

TextFilter.propTypes = {
  column: PropTypes.shape({
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
  }),
};

export function MultiselectFilter(choices, {column: { filterValue, setFilter }}) {
  const value = filterValue || [];

  const onChange = e => {
    setFilter(e.target.value.length ? e.target.value : undefined)
  };

  return (
    <FormControl style={{ width: "100%" }}>
      <Select multiple value={value} onChange={onChange} renderValue={v => v.join(', ')}>
        {choices.map((choice, index) => 
          <MenuItem key={index} value={choice}>
            <Checkbox checked={value.includes(choice)} />
            <ListItemText primary={choice} />
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
