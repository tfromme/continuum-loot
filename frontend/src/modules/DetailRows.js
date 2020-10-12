import React from 'react';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Check from '@material-ui/icons/Check';
import Clear from '@material-ui/icons/Clear';
import  { styled } from '@material-ui/core/styles';

import CustomPropTypes from './CustomPropTypes.js';
import { OldEditItemAutocomplete, PriorityEditIndividual } from './EditComponents.js';
import Api from './Api.js';

const DarkPaper = styled(Paper)({
  background: '#ccc',
});

const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth',
                  'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
                  'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth'];

export function WishlistRow(props) {
  const numWishlist = 10;
  var initialData = Array(numWishlist).fill(null);

  for (const item of props.rowData.wishlist) {
    initialData[item.prio - 1] = item.item_id;
  }

  const [editing, setEditing] = React.useState(false);
  const [wishlistData, setWishlistData] = React.useState(initialData);

  var wishlistLookup = {};
  for (const item of props.items) {
    wishlistLookup[item.id] = item.name;
  }

  const changeWishlistData = index => (
    newId => {
      let newData = [ ...wishlistData ];
      newData[index] = newId;
      setWishlistData(newData);
    }
  );

  const saveWishlist = () => {
    setEditing(false);

    var updatedPlayer = props.rowData;
    updatedPlayer.wishlist = [];
    wishlistData.forEach((itemId, index) => {
      if (itemId) {
        updatedPlayer.wishlist.push({'prio': (index+1), 'item_id': itemId});
      }
    });
    Api.player.update(updatedPlayer, props.updateRemoteData);
  }

  const clear = () => {
    setEditing(false);
    setWishlistData(initialData);
  }

  var buttons;
  if (!props.editable) {
    buttons = null;
  } else if (editing) {
    buttons = (
      <>
        <IconButton size="small" onClick={saveWishlist}>
          <Check />
        </IconButton>
        <IconButton size="small" onClick={clear}>
          <Clear />
        </IconButton>
      </>
    );
  } else {
    buttons = (
      <IconButton size="small" onClick={() => setEditing(true)}>
        <Edit />
      </IconButton>
    );
  }

  var cells = wishlistData.map((itemId, index) =>
    <TableCell key={index}>{itemId ? wishlistLookup[itemId] : null}</TableCell>
  );
  
  if (editing) {
    cells = wishlistData.map((itemId, index) =>
      <TableCell key={index}>
        <OldEditItemAutocomplete
          items={props.items}
          initialValue={props.items.find(x => x.id === itemId) || null}
          onChange={changeWishlistData(index)}
        />
      </TableCell>
    );
  }

  return (
    <TableContainer component={DarkPaper}>
      <Table size="small" style={{tableLayout: 'fixed'}}>
        <TableHead>
          <TableRow>
            <TableCell className="no-width-fix" />
            <TableCell />
            {ordinals.slice(0, numWishlist).map((num, index) =>
            <TableCell key={index}>{num}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell style={{textAlign: 'right'}}>{buttons}</TableCell>
            <TableCell variant='head'>Wishlist</TableCell>
            {cells}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

WishlistRow.propTypes = {
  rowData: CustomPropTypes.player.isRequired,
  items: PropTypes.arrayOf(CustomPropTypes.item).isRequired,
  updateRemoteData: PropTypes.func.isRequired,
  editable: PropTypes.bool,
}

WishlistRow.defaultProps = {
  editable: false,
}

export function AttendanceRow(props) {

  const getAttendanceStr = (rowData, raidId) => {
    if (rowData.attendance.includes(raidId)) {
      return 'Yes';
    }
    for (const altId of rowData.alts) {
      if (props.players.find(x => x.id === altId).attendance.includes(raidId)) {
        return 'Alt';
      }
    }
    return 'No';
  }

  const getCellStyle = cellData => {
    if (cellData === 'Yes') {
      return {fontWeight: '500', color: '#4CAF50'};
    } else if (cellData === 'No') {
      return {fontWeight: '500', color: '#F44336'};
    } else if (cellData === 'Alt') {
      return {fontWeight: '500', color: '#2196F3'};
    }
  }
  
  const numRaids = 12;
  const lastXRaidDays = props.raidDays.slice(0, numRaids).reverse();

  var headerData = [];
  var attendanceData = [];

  for (let i=lastXRaidDays.length-1; i>=0; i--) {
    headerData.push(lastXRaidDays[i].name)
    attendanceData.push(getAttendanceStr(props.rowData, lastXRaidDays[i].id));
  }

  for (let i=lastXRaidDays.length; i<numRaids; i++) {
    headerData.push('');
    attendanceData.push('');
  }

  return (
    <TableContainer component={DarkPaper}>
      <Table size="small" style={{tableLayout: 'fixed'}}>
        <TableHead>
          <TableRow>
            <TableCell className="no-width-fix" />
            {headerData.map((data, index) =>
              <TableCell style={{fontWeight: '500'}} key={index}>{data}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell variant='head' style={{textAlign: 'center'}}>Attendance</TableCell>
            {attendanceData.map((data, index) =>
              <TableCell style={getCellStyle(data)} key={index}>{data}</TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

AttendanceRow.propTypes = {
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
  rowData: CustomPropTypes.player.isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
}

// TODO: Refactor - combine with LootHistoryItemsRow
export function LootHistoryRow(props) {
  var itemLookup = {};
  for (const item of props.items) {
    itemLookup[item.id] = item.name;
  }

  const numItems = 6;
  const lastXItems = props.lootHistory.filter(x => x.player_id === props.rowData.id).slice(0, numItems).reverse();

  const filterFunc = i => (x => x.id === lastXItems[i].raid_day_id);

  var headerData = [];
  var itemData = [];

  for (let i=lastXItems.length-1; i>=0; i--) {
    headerData.push(props.raidDays.find(filterFunc(i)).name);
    itemData.push(itemLookup[lastXItems[i].item_id]);
  }

  for (let i=lastXItems.length; i<numItems; i++) {
    headerData.push('');
    itemData.push('');
  }

  const headerRow = lastXItems.length > 0 ? (
    <TableHead>
      <TableRow>
        <TableCell className="no-width-fix" />
        {headerData.map((data, index) =>
          <TableCell key={index}>{data}</TableCell>
        )}
      </TableRow>
    </TableHead>
  ) : null;

  if (lastXItems.length === 0) {
    itemData[0] = 'None';
  }

  return (
    <TableContainer component={DarkPaper}>
      <Table size="small" style={{tableLayout: 'fixed'}}>
        {headerRow}
        <TableBody>
          <TableRow>
            <TableCell variant='head' style={{textAlign: 'center'}}>Recent Items Won</TableCell>
            {itemData.map((data, index) =>
              <TableCell key={index}>{data}</TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

LootHistoryRow.propTypes = {
  rowData: CustomPropTypes.player.isRequired,
  lootHistory: PropTypes.arrayOf(CustomPropTypes.lootHistory).isRequired,
  items: PropTypes.arrayOf(CustomPropTypes.item).isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
}

// TODO: Add drag'n'drop with react-sortable-hoc
export function PriorityRow(props) {
  const numIndividual = 3;
  const numClass = 3;

  const initialValue = {
    individual: [],
    class: [],
  };

  for (let i = 0; i < numIndividual; i++) {
    const currentIndividual = props.rowData.individual_prio.find(x => x.prio === (i+1));
    if (currentIndividual) {
      const player = props.players.find(x => x.id === currentIndividual.player_id);
      const setBy = props.players.find(x => x.id === currentIndividual.set_by);
      initialValue.individual.push({player: player, setBy: setBy});
    } else {
      initialValue.individual.push({player: null, setBy: null});
    }
  }

  for (let i = 0; i < numClass; i++) {
    const currentClass = props.rowData.class_prio.find(x => x.prio === (i+1));
    if (currentClass) {
      const setBy = props.players.find(x => x.id === currentClass.set_by);
      initialValue.class.push({class: currentClass.class, setBy: setBy});
    } else {
      initialValue.class.push({class: '', setBy: null});
    }
  }

  const [editingIndividual, setEditingIndividual] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState(false);
  const [iPrios, setIPrios] = React.useState(initialValue.individual);
  const [cPrios, setCPrios] = React.useState(initialValue.class);

  const changeIPrios = index => (
    newData => {
      let newPrios = [ ...iPrios ];
      newPrios[index].player = newData
      newPrios[index].setBy = props.loggedInPlayer.id
      setIPrios(iPrios);
    }
  );

  const changeCPrios = index => (
    e => {
      let newPrios = [ ...cPrios ];
      newPrios[index].class = e.target.value;
      newPrios[index].setBy = props.loggedInPlayer.id;
      setCPrios(newPrios);
    }
  );

  const saveIndividual = () => {
    setEditingIndividual(false);

    var newIndividualPrio = [];

    for (let i = 0; i < numIndividual; i++) {
      if (iPrios[i].player) {  // Check if anything was selected
        const setBy = iPrios[i].player === initialValue.individual[i].player
                       ? initialValue.individual[i].setBy.id
                       : props.loggedInPlayer.id;
        newIndividualPrio.push({player_id: iPrios[i].player.id, prio: i + 1, set_by: setBy});
      }
    }

    props.rowData.individual_prio = newIndividualPrio;
    Api.item.update(props.rowData, props.updateRemoteData);
  }

  const saveClass = () => {
    setEditingClass(false);

    var newClassPrio = [];

    for (let i = 0; i < numClass; i++) {
      if (cPrios[i].class) {  // Check if anything was typed
        const setBy = cPrios[i].class === initialValue.class[i].class
                       ? initialValue.class[i].setBy.id
                       : props.loggedInPlayer.id;
        newClassPrio.push({class: cPrios[i].class, prio: i + 1, set_by: setBy});
      }
    }

    props.rowData.class_prio = newClassPrio;
    Api.item.update(props.rowData, props.updateRemoteData);
  }

  const clear = () => {
    setEditingIndividual(false);
    setEditingClass(false);
    setIPrios(initialValue.individual);
    setCPrios(initialValue.class);
  }

  var individualButtons;
  var classButtons;
  if (!props.editable) {
    individualButtons = null;
    classButtons = null;
  } else if (editingIndividual) {
    individualButtons = (
      <>
        <IconButton size="small" onClick={saveIndividual}>
          <Check />
        </IconButton>
        <IconButton size="small" onClick={clear}>
          <Clear />
        </IconButton>
      </>
    );
    classButtons = null;
  } else if (editingClass) {
    classButtons = (
      <>
        <IconButton size="small" onClick={saveClass}>
          <Check />
        </IconButton>
        <IconButton size="small" onClick={clear}>
          <Clear />
        </IconButton>
      </>
    );
    individualButtons = null;
  } else {  // Editable but not editing anything
    individualButtons = (
      <IconButton size="small" onClick={() => setEditingIndividual(true)}>
        <Edit />
      </IconButton>
    );
    classButtons = (
      <IconButton size="small" onClick={() => setEditingClass(true)}>
        <Edit />
      </IconButton>
    );
  }

  var individualCells = iPrios.map((prio, index) =>
    <TableCell key={index}>{prio.player ? prio.player.name : null}</TableCell>
  );

  if (editingIndividual) {
    individualCells = iPrios.map((prio, index) =>
        <TableCell key={index}>
          <PriorityEditIndividual players={props.players} initialValue={prio.player}
                                  onChange={changeIPrios(index)} />
        </TableCell>
    );
  }

  var classCells = cPrios.map((prio, index) =>
    <TableCell key={index}>{prio.class}</TableCell>
  );

  if (editingClass) {
    classCells = cPrios.map((prio, index) =>
      <TableCell key={index}>
        <TextField value={cPrios[index].class} onChange={changeCPrios(index)} />
      </TableCell>
    );
  }

  return (
    <TableContainer component={DarkPaper}>
      <Table size="small" style={{tableLayout: 'fixed'}}>
        <TableHead>
          <TableRow>
            <TableCell className="no-width-fix" />
            <TableCell />
            {ordinals.slice(0, numIndividual).map((num, index) =>
              <TableCell key={index}>{num}</TableCell>
            )}
            <TableCell />
            <TableCell />
            {ordinals.slice(0, numClass).map((num, index) =>
              <TableCell key={index}>{num}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell style={{textAlign: 'right'}}>{individualButtons}</TableCell>
            <TableCell variant='head'>Individual Prio</TableCell>
            {individualCells}
            <TableCell style={{textAlign: 'right'}}>{classButtons}</TableCell>
            <TableCell variant='head'>Class Prio</TableCell>
            {classCells}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

PriorityRow.propTypes = {
  rowData: CustomPropTypes.item.isRequired,
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
  loggedInPlayer: CustomPropTypes.user,
  updateRemoteData: PropTypes.func.isRequired,
  editable: PropTypes.bool,
}

PriorityRow.defaultProps = {
  loggedInPlayer: null,
  editable: false,
}

// TODO: Refactor - combine with LootHistoryRow
export function LootHistoryItemsRow(props) {
  var playerLookup = {};
  for (const player of props.players) {
    playerLookup[player.id] = player.name;
  }

  const numPlayers = 6;
  const lastXPlayers = props.lootHistory.filter(x => x.item_id === props.rowData.id).slice(0, numPlayers).reverse();

  const filterFunc = i => (x => x.id === lastXPlayers[i].raid_day_id);

  var headerData = [];
  var playerData = [];

  for (let i=lastXPlayers.length-1; i>=0; i--) {
    headerData.push(props.raidDays.find(filterFunc(i)).name);
    playerData.push(playerLookup[lastXPlayers[i].player_id]);
  }

  for (let i=lastXPlayers.length; i<numPlayers; i++) {
    headerData.push('');
    playerData.push('');
  }

  const headerRow = lastXPlayers.length > 0 ? (
    <TableHead>
      <TableRow>
        <TableCell className="no-width-fix" />
        {headerData.map((data, index) =>
          <TableCell key={index}>{data}</TableCell>
        )}
      </TableRow>
    </TableHead>
  ) : null;

  if (lastXPlayers.length === 0) {
    playerData[0] = 'None';
  }

  return (
    <TableContainer component={DarkPaper}>
      <Table size="small" style={{tableLayout: 'fixed'}}>
        {headerRow}
        <TableBody>
          <TableRow>
            <TableCell variant='head' style={{textAlign: 'center'}}>Recent Recipients</TableCell>
            {playerData.map((data, index) =>
              <TableCell key={index}>{data}</TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

LootHistoryItemsRow.propTypes = {
  rowData: CustomPropTypes.item.isRequired,
  lootHistory: PropTypes.arrayOf(CustomPropTypes.lootHistory).isRequired,
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
}
