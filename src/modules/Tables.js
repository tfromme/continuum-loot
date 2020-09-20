import React from 'react';
import PropTypes from 'prop-types';

import MaterialTable from 'material-table';
import HowToRegOutlined from '@material-ui/icons/HowToRegOutlined';
import AssignmentOutlined from '@material-ui/icons/AssignmentOutlined';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from'@material-ui/core/MenuItem';
import Checkbox from'@material-ui/core/Checkbox';
import ListItemText from'@material-ui/core/ListItemText';

import CustomPropTypes from './CustomPropTypes.js';
import { classes, ranks, roles } from './Constants.js';
import { updatePlayer, updateItem, updateLootHistory } from './Api.js';
import { WishlistRow, AttendanceRow, LootHistoryRow, PriorityRow, LootHistoryItemsRow } from './DetailRows.js';


function arrayToObj(arr) {
  var obj = {}
  for (const item of arr) {
    obj[item] = item;
  }
  return obj;
}

export function PlayerTable(props) {
  const fullEditable = props.loggedInPlayer && props.loggedInPlayer.permission_level >= 2 ? 'always' : 'never';
  const rowEditable = rowData => (props.loggedInPlayer
                                  ? (rowData.id === props.loggedInPlayer.id || props.loggedInPlayer.permission_level >= 2)
                                  : false);
  const defaultFilter = ranks.filter(name => name !== 'Inactive');

  const [ columns ] = React.useState([
    { title: 'Name', field: 'name', filtering: false, defaultSort: 'asc', editable: fullEditable },
    { title: 'Class', field: 'class', lookup: arrayToObj(classes), editable: fullEditable },
    { title: 'Rank', field: 'rank', defaultFilter: defaultFilter, lookup: arrayToObj(ranks), editable: fullEditable },
    { title: 'Role', field: 'role', lookup: arrayToObj(roles) },
    { title: 'Notes', field: 'notes', filtering: false },
  ]);

  return (
    <MaterialTable
      columns={columns}
      data={ props.players }
      title="Players"
      options={ { paging: false, filtering: true, draggable: false} }
      localization={{header: {actions: ''}}}
      editable={ {
        isEditable: rowEditable,
        isEditHidden: rowData => !rowEditable(rowData),
        onRowUpdate: (newData, _oldData) => {
          return new Promise((resolve, _reject) => {
            updatePlayer(newData, props.updateRemoteData);  // API Call
            resolve();
          });
        },
      } }
      detailPanel={[
        {
          icon: 'favorite_border',
          openIcon: 'favorite',
          tooltip: 'Wishlist',
          render: rowData => (
            <WishlistRow
              rowData={rowData}
              items={props.items}
              updateRemoteData={props.updateRemoteData}
              editable={rowEditable(rowData)}
            />
          ),
        },
        {
          icon: HowToRegOutlined,
          openIcon: 'how_to_reg',
          tooltip: 'Attendance',
          render: rowData => (
            <AttendanceRow
              rowData={rowData}
              raidDays={props.raidDays}
            />
          ),
        },
        {
          icon: 'history',
          openIcon: 'watch_later',
          tooltip: 'Recent Loot History',
          render: rowData => (
            <LootHistoryRow
              rowData={rowData}
              lootHistory={props.lootHistory}
              items={props.items}
              raidDays={props.raidDays}
            />
          ),
        },
      ]}
    />
  );
}

PlayerTable.propTypes = {
  loggedInPlayer: CustomPropTypes.user,
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
  items: PropTypes.arrayOf(CustomPropTypes.item).isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
  lootHistory: PropTypes.arrayOf(CustomPropTypes.lootHistory).isRequired,
  updateRemoteData: PropTypes.func.isRequired,
}

PlayerTable.defaultProps = {
  loggedInPlayer: null,
}

export function ItemTable(props) {
  const rowEditable = props.loggedInPlayer && props.loggedInPlayer.permission_level >= 1;

  var raidShortNameLookup = {};
  for (const raid of props.raids) {
    raidShortNameLookup[raid.id] = raid.short_name;
  }

  const [ columns, setColumns ] = React.useState([
    { title: 'Name', field: 'name', defaultSort: 'asc', editable: 'never' },
    { title: 'Type', field: 'type', editable: 'never' },
    { title: 'Raid', field: 'raid', defaultFilter: ['2'], lookup: raidShortNameLookup, editable: 'never' },
    { title: 'Bosses', field: 'bosses', editable: 'never', render: ((rowData) => {
      return rowData.bosses.reduce((all, cur, index) => [
        ...all,
        <br key={index}/>,
        cur,
      ]);
    }) },
    { title: 'Tier', field: 'tier', type: 'numeric' },
    { title: 'Notes', field: 'notes', filtering: false },
  ]);

  React.useEffect(() => {
    if (Object.keys(columns[2].lookup).length === 0) {
      for (const raid of props.raids) {
        raidShortNameLookup[raid.id] = raid.short_name;
      }
      columns[2].lookup = raidShortNameLookup;
      setColumns(columns);
    }
  }, [raidShortNameLookup, columns, props.raids]);

  return (
    <MaterialTable
      columns={columns}
      data={ props.items }
      title="Items"
      options={ { paging: false, filtering: true } }
      localization={{header: {actions: ''}}}
      editable={ {
        isEditable: _ => rowEditable,
        isEditHidden: _ => !rowEditable,
        onRowUpdate: (newData, _oldData) => {
          return new Promise((resolve, _reject) => {
            updateItem(newData, props.updateRemoteData);  // API Call
            resolve();
          });
        },
      } }
      detailPanel={[
        {
          icon: AssignmentOutlined,
          openIcon: 'assignment',
          tooltip: 'Item Priorities',
          render: rowData => (
            <PriorityRow
              rowData={rowData}
              players={props.players}
              loggedInPlayer={props.loggedInPlayer}
              updateRemoteData={props.updateRemoteData}
              editable={rowEditable}
            />
          ),
        },
        {
          icon: 'history',
          openIcon: 'watch_later',
          tooltip: 'Recent Loot History',
          render: rowData => (
            <LootHistoryItemsRow
              rowData={rowData}
              lootHistory={props.lootHistory}
              players={props.players}
              raidDays={props.raidDays}
            />
          ),
        },
      ]}
    />
  );
}

ItemTable.propTypes = {
  loggedInPlayer: CustomPropTypes.user,
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
  items: PropTypes.arrayOf(CustomPropTypes.item).isRequired,
  raids: PropTypes.arrayOf(CustomPropTypes.raid).isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
  lootHistory: PropTypes.arrayOf(CustomPropTypes.lootHistory).isRequired,
  updateRemoteData: PropTypes.func.isRequired,
}

ItemTable.defaultProps = {
  loggedInPlayer: null,
}

function CustomLHFilter(props) {
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

CustomLHFilter.propTypes = {
  onFilterChanged: PropTypes.func.isRequired,
  columnDef: PropTypes.shape({tableData: PropTypes.object}).isRequired,
}


export function LootHistoryTable(props) {
  const rowEditable = props.loggedInPlayer && props.loggedInPlayer.permission_level >= 2;

  var raidDayLookup = {};
  for (const raidDay of props.raidDays) {
    raidDayLookup[raidDay.id] = raidDay.name;
  }

  var nameLookup = {};
  var classLookup = {};
  var roleLookup = {};
  for (const player of props.players) {
    nameLookup[player.id] = player.name;
    classLookup[player.id] = player.class;
    roleLookup[player.id] = player.role;
  }

  var itemLookup = {};
  var tierLookup = {};
  for (const item of props.items) {
    itemLookup[item.id] = item.name;
    tierLookup[item.id] = item.tier;
  }

  const raidDaySort = (a, b) => {
    const raidDayA = props.raidDays.find(x => x.id === a.raid_day_id);
    const raidDayB = props.raidDays.find(x => x.id === b.raid_day_id);
    return Date.parse(raidDayA.date) - Date.parse(raidDayB.date);
  }

  const raidDaySearch = (term, rowData) => {
    const raidDay = props.raidDays.find(x => x.id === rowData.raid_day_id);
    return term.length === 0 || term.includes(raidDay.raid_id);
  }

  const [ columns ] = React.useState([
    { title: 'Raid', field: 'raid_day_id', lookup: raidDayLookup, defaultSort: 'desc', customSort: raidDaySort, filterComponent: CustomLHFilter, customFilterAndSearch: raidDaySearch },
    { title: 'Name', field: 'player_id', lookup: nameLookup },
    { title: 'Class', field: 'player_id', lookup: classLookup, editable: 'never' },
    { title: 'Role', field: 'player_id', lookup: roleLookup, editable: 'never' },
    { title: 'Item', field: 'item_id', lookup: itemLookup },
    { title: 'Item Tier', field: 'item_id', lookup: tierLookup, editable: 'never' },
  ]);

  return (
    <MaterialTable
      columns={columns}
      data={ props.lootHistory }
      title="Loot History"
      options={ { paging: false, filtering: true, draggable: false} }
      localization={{header: {actions: ''}}}
      editable={ {
        isEditable: _ => rowEditable,
        isEditHidden: _ => !rowEditable,
        onRowUpdate: (newData, _oldData) => {
          return new Promise((resolve, _reject) => {
            updateLootHistory(newData, props.updateRemoteData);  // API Call
            resolve();
          });
        },
      } }
    />
  );
}

LootHistoryTable.propTypes = {
  loggedInPlayer: CustomPropTypes.user,
  players: PropTypes.arrayOf(CustomPropTypes.player).isRequired,
  items: PropTypes.arrayOf(CustomPropTypes.item).isRequired,
  raidDays: PropTypes.arrayOf(CustomPropTypes.raidDay).isRequired,
  lootHistory: PropTypes.arrayOf(CustomPropTypes.lootHistory).isRequired,
  updateRemoteData: PropTypes.func.isRequired,
}

LootHistoryTable.defaultProps = {
  loggedInPlayer: null,
}
