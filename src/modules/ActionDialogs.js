import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import CustomPropTypes from './CustomPropTypes.js';
import { SubmissionDialog, PaddedSelect, PaddedTextField } from './Generics.js';
import { postApi } from './Api.js';

export function AttendanceDialog(props) {
  return <NewRaidDialog title='Attendance Upload'
                        buttonText='Upload Attendance'
                        apiTarget='/api/uploadAttendance'
                        validate={isCommaSeparatedList}
                        errorString='Input must be comma-separated list'
                        {...props}
  />
}

AttendanceDialog.propTypes = {
  raids: PropTypes.arrayOf(CustomPropTypes.raid).isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
  updateRemoteData: PropTypes.func.isRequired,
  leftPadded: PropTypes.bool,
}

AttendanceDialog.defaultProps = {
  leftPadded: false,
}

export function LootHistoryDialog(props) {
  return <NewRaidDialog title='Loot History Upload'
                        buttonText='Upload Loot History'
                        apiTarget='/api/uploadLootHistory'
                        validate={isJsonStructure}
                        errorString='Input must be valid JSON'
                        {...props}
  />
}

LootHistoryDialog.propTypes = {
  raids: PropTypes.arrayOf(CustomPropTypes.raid).isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
  updateRemoteData: PropTypes.func.isRequired,
  leftPadded: PropTypes.bool,
}

LootHistoryDialog.defaultProps = {
  leftPadded: false,
}

function NewRaidDialog(props) {
  const NEW_RAID_DAY = 'New';
  const [input, setInput] = React.useState('');
  const [raidDay, setRaidDay] = React.useState(NEW_RAID_DAY);
  const [newRaid, setNewRaid] = React.useState(NEW_RAID_DAY);
  const [newName, setNewName] = React.useState('');
  const [newDate, setNewDate] = React.useState(new Date(Date.now()));

  const dateFns = new DateFnsUtils();

  const postData = () => {
    const data = {
      'data': input,
      'raid_day_id': raidDay,
    };

    if (raidDay === NEW_RAID_DAY) {
      data.raid_id = newRaid;
      data.raid_day_name = newName;
      data.date = dateFns.format(newDate, 'yyyy-MM-dd');
    }
    
    return postApi(props.apiTarget, data).then(_res => {
      props.updateRemoteData('players', 'lootHistory', 'raids');
    });
  };

  const onClose = () => {
    setInput('');
  };

  const handleChangeInput = e => {
    setInput(e.target.value);
  };

  const handleChangeRaidDay = e => {
    setRaidDay(e.target.value);
  };

  const handleChangeNewName = e => {
    setNewName(e.target.value);
  };

  const handleChangeNewRaid = e => {
    setNewRaid(e.target.value);
  };

  const validate = () => (input === '' || props.validate(input));

  var newRaidDayInputs = null;

  if (raidDay === NEW_RAID_DAY) {
    newRaidDayInputs = (
      <>
        <FormControl variant="filled">
          <InputLabel id="raid-select-label">Raid</InputLabel>
          <PaddedSelect labelId="raid-select-label" value={newRaid} onChange={handleChangeNewRaid}>
            {props.raids.map(raid =>
              <MenuItem value={raid.id} key={raid.id}>{raid.short_name}</MenuItem>
            )}
          </PaddedSelect>
        </FormControl>
        <br />
        <PaddedTextField label="Raid Day Name" variant="filled"
                           value={newName} onChange={handleChangeNewName} />
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker value={newDate} onChange={setNewDate} autoOk disableFuture
                              inputVariant='filled' variant='inline' />
        </MuiPickersUtilsProvider>
      </>
    );
  }

  return (
    <SubmissionDialog
      buttonText={props.buttonText}
      title={props.title}
      onClose={onClose}
      onSubmit={postData}
      error={!validate()}
      errorMessage={props.errorString}
      submitButtonText='Upload'
      leftPadded={props.leftPadded}
    >
      <FormControl variant="filled">
        <InputLabel id="raidday-select-label">Raid Day</InputLabel>
        <PaddedSelect labelId="raidday-select-label" value={raidDay} onChange={handleChangeRaidDay}>
          <MenuItem value={NEW_RAID_DAY}>New Raid Day</MenuItem>
          {props.raidDays.map(day =>
            <MenuItem value={day.id} key={day.id}>{day.name}</MenuItem>
          )}
        </PaddedSelect>
      </FormControl>
      {newRaidDayInputs}
      <TextField error={!validate()} label="Export String" variant="filled"
                 multiline rows={6} fullWidth value={input} onChange={handleChangeInput} />
    </SubmissionDialog>
  );
}

NewRaidDialog.propTypes = {
  raids: PropTypes.arrayOf(CustomPropTypes.raid).isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
  updateRemoteData: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  apiTarget: PropTypes.string.isRequired,
  validate: PropTypes.func.isRequired,
  errorString: PropTypes.string,
  leftPadded: PropTypes.bool,
}

NewRaidDialog.defaultProps = {
  errorString: 'Invalid export string',
  leftPadded: false,
}

function isCommaSeparatedList(str) {
  // Removes accent marks - See stackoverflow.com/questions/990904
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /^([a-z]+)(,[a-z]+)*$/.test(str.toLowerCase());
}

// See stackoverflow.com/questions/9804777
function isJsonStructure(str) {
  if (typeof str !== 'string') return false;
  try {
    const result = JSON.parse(str);
    const type = Object.prototype.toString.call(result);
    return type === '[object Object]'
        || type === '[object Array]';
  } catch (err) {
    return false;
  }
}
