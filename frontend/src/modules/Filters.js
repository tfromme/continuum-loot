import React from 'react';
import PropTypes from 'prop-types';

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from'@material-ui/core/MenuItem';
import Checkbox from'@material-ui/core/Checkbox';
import ListItemText from'@material-ui/core/ListItemText';

// TODO: Why did I hardcode this?
// Maybe combine with MultiselectFilter
export function RaidFilter(props) {
  const [selectedVal, setSelectedVal] = React.useState([]);

  const handleChange = e => {
    setSelectedVal(e.target.value);
    props.onFilterChanged(props.columnDef.tableData.id, e.target.value);
  }

  const raidIdMap = {2: 'AQ', 1: 'BWL'};
  const renderRaids = selected => selected.map(s => raidIdMap[s]).join(', ');

  return (
    <FormControl style={{ width: "100%" }}>
      <Select multiple value={selectedVal} onChange={handleChange} renderValue={renderRaids}>
        <MenuItem value={2}>
          <Checkbox checked={selectedVal.includes(2)} />
          <ListItemText primary='AQ' />
        </MenuItem>
        <MenuItem value={1}>
          <Checkbox checked={selectedVal.includes(1)} />
          <ListItemText primary='BWL' />
        </MenuItem>
      </Select>
    </FormControl>
  );
}

RaidFilter.propTypes = {
  onFilterChanged: PropTypes.func.isRequired,
  columnDef: PropTypes.shape({tableData: PropTypes.object}).isRequired,
}

export function MultiselectFilter(props) {
  const [selectedVal, setSelectedVal] = React.useState([]);

  const handleChange = e => {
    setSelectedVal(e.target.value);
    props.onFilterChanged(props.columnDef.tableData.id, e.target.value);
  }

  const renderValue = selected => selected.join(', ');

  return (
    <FormControl style={{ width: "100%" }}>
      <Select multiple value={selectedVal} onChange={handleChange} renderValue={renderValue}>
        {props.choices.map((choice, index) => 
        <MenuItem key={index} value={props.choiceTexts ? props.choiceTexts[index] : choice}>
            <Checkbox checked={selectedVal.includes(choice)} />
            <ListItemText primary={props.choiceTexts ? props.choiceTexts[index] : choice} />
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

MultiselectFilter.propTypes = {
  onFilterChanged: PropTypes.func.isRequired,
  columnDef: PropTypes.shape({tableData: PropTypes.object}).isRequired,
  choices: PropTypes.array.isRequired,
  choiceTexts: PropTypes.array,
}

MultiselectFilter.defaultProps = {
  choiceTexts: null,
}
