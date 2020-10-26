import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FilterList from '@material-ui/icons/FilterList';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';

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

export function OldMultiselectFilter(props) {
  const [selectedVal, setSelectedVal] = React.useState(props.initialValue);

  const handleChange = e => {
    setSelectedVal(e.target.value);
    props.onFilterChanged(props.columnDef.tableData.id, e.target.value);
  }

  const renderValue = selected => selected.join(', ');

  return (
    <FormControl style={{ width: "100%" }}>
      <Select multiple value={selectedVal} onChange={handleChange} renderValue={renderValue}>
        {props.choices.map((choice, index) => 
          <MenuItem key={index} value={choice}>
            <Checkbox checked={selectedVal.includes(choice)} />
            <ListItemText primary={choice} />
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

OldMultiselectFilter.propTypes = {
  onFilterChanged: PropTypes.func.isRequired,
  columnDef: PropTypes.shape({tableData: PropTypes.object}).isRequired,
  choices: PropTypes.array.isRequired,
  initialValue: PropTypes.array,
}

OldMultiselectFilter.defaultProps = {
  initialValue: [],
}
