import React from 'react';
import MaterialTable from 'material-table';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import { classes, ranks, roles } from './Constants.js'
import { updatePlayer } from './Api.js'

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

  return (
    <MaterialTable
      columns={[
        { title: 'Name', field: 'name', filtering: false, defaultSort: 'asc', editable: fullEditable },
        { title: 'Class', field: 'class', lookup: arrayToObj(classes), editable: fullEditable },
        { title: 'Rank', field: 'rank', defaultFilter: defaultFilter, lookup: arrayToObj(ranks), editable: fullEditable },
        { title: 'Role', field: 'role', lookup: arrayToObj(roles) },
        { title: 'Notes', field: 'notes', filtering: false },
      ]}
      data={ props.players }
      title="Players"
      options={ { paging: false, filtering: true, draggable: false} }
      editable={ {
        isEditable: rowEditable,
        isEditHidden: rowData => !rowEditable(rowData),
        onRowUpdate: (newData, oldData) => {
          return new Promise((resolve, reject) => {
            updatePlayer(newData, props.updateRemoteData);  // API Call
            resolve();
          });
        },
      } }
      detailPanel={ rowData =>
        <>
          <WishlistRow
            rowData={rowData}
            items={props.items}
            updateRemoteData={props.updateRemoteData}
            editable={rowEditable(rowData)}
          />
          <AttendanceRow
            rowData={rowData}
            raidDays={props.raidDays}
            editable={rowEditable(rowData)}
          />
        </>
      }
      onRowClick={ (event, rowData, togglePanel) => togglePanel() }
    />
  );
}

function WishlistEditItem(props) {
  const [inputValue, setInputValue] = React.useState('');
  const [value, setValue] = React.useState(props.initialValue);
  return (
    <Autocomplete
      options={props.items}
      getOptionLabel={option => option.name}
      value={value}
      onChange={(e, newVal) => { setValue(newVal); props.onChange(newVal.id); }}
      inputValue={inputValue}
      onInputChange={(e, newInputVal) => { setInputValue(newInputVal); }}
      renderInput={params => <TextField {...params} />}
    />
  );
}

function WishlistRow(props) {
  var wishlistData = {'name': 'Wishlist'};
  for (const item of props.rowData.wishlist) {
    wishlistData[item.prio] = item.item_id;
  }

  var wishlistLookup = {};
  for (const item of props.items) {
    wishlistLookup[item.id] = item.name;
  }

  const customEditComponent = index => (xProps => (
    <WishlistEditItem
      items={props.items}
      initialValue={props.items.find(x => x.id === wishlistData[index])}
      onChange={xProps.onChange}
    />
  ));

  return (
    <MaterialTable
      columns={[
        {title: '', field: 'name', editable: 'never', cellStyle: {fontWeight: '500'}}, 
        {title: 'First', field: '1', lookup: wishlistLookup, editComponent: customEditComponent(1)},
        {title: 'Second', field: '2', lookup: wishlistLookup, editComponent: customEditComponent(2)},
        {title: 'Third', field: '3', lookup: wishlistLookup, editComponent: customEditComponent(3)},
        {title: 'Fourth', field: '4', lookup: wishlistLookup, editComponent: customEditComponent(4)},
        {title: 'Fifth', field: '5', lookup: wishlistLookup, editComponent: customEditComponent(5)},
        {title: 'Sixth', field: '6', lookup: wishlistLookup, editComponent: customEditComponent(6)},
        {title: 'Seventh', field: '7', lookup: wishlistLookup, editComponent: customEditComponent(7)},
        {title: 'Eighth', field: '8', lookup: wishlistLookup, editComponent: customEditComponent(8)},
        {title: 'Ninth', field: '9', lookup: wishlistLookup, editComponent: customEditComponent(9)},
        {title: 'Tenth', field: '10', lookup: wishlistLookup, editComponent: customEditComponent(10)},
      ]}
      data={[wishlistData]}
      options={ { sorting: false, paging: false, showTitle: false, toolbar: false, draggable: props.editable } }
      localization={{header: {actions: ''}}}
      editable={ {
        isEditable: x => props.editable,
        isEditHidden: x => !props.editable,
        onRowUpdate: (newData, oldData) => {
          var updatedPlayer = props.rowData;
          updatedPlayer.wishlist = [];
          for (const prio in newData) {
            if (prio !== 'name') {
              updatedPlayer.wishlist.push({'prio': prio, 'item_id': newData[prio]});
            }
          }
          return new Promise((resolve, reject) => {
            updatePlayer(updatedPlayer, props.updateRemoteData);  // API Call
            resolve();
          });
        },
      } }
    />
  );
}

function AttendanceRow(props) {
  
  const yesStyle = {fontWeight: '500', color: '#4CAF50'};
  const noStyle = {fontWeight: '500', color: '#F44336'};

  // 55 and 45 are "good enough" attempts to get the first columns lined up
  var attendanceColumns = [{width: props.editable ? 55 : 45}, {title: '', field: 'name', cellStyle: {fontWeight: '500'}}];
  var attendanceData = {'name': 'Attendance'};
  
  const numRaids = 12;
  const lastXRaidDays = props.raidDays.slice(props.raidDays.length - numRaids);
  for (var i=0; i<numRaids; i++) {
    attendanceData[i.toString()] = props.rowData.attendance.includes(lastXRaidDays[numRaids-1-i].id) ? 'Yes' : 'No';
    attendanceColumns.push({title: lastXRaidDays[numRaids-1-i].name,
                            field: i.toString(),
                            cellStyle: cellData => cellData === 'Yes' ? yesStyle : noStyle,
    });
  }

  return (
    <MaterialTable
      columns={attendanceColumns}
      data={[attendanceData]}
      options={ { sorting: false, paging: false, showTitle: false, toolbar: false, draggable: false } }
    />
  );
}

export function ItemTable(props) {
  var raidShortNameLookup = {};
  for (const raid of props.raids) {
    raidShortNameLookup[raid.id] = raid.short_name;
  }

  return (
    <MaterialTable
      columns={[
        { title: 'Name', field: 'name', defaultSort: 'asc' },
        { title: 'Type', field: 'type' },
        { title: 'Raid', field: 'raid', lookup: raidShortNameLookup },
        { title: 'Bosses', field: 'bosses', render: ((rowData) => {
          return rowData.bosses.reduce((all, cur) => [
            ...all,
            <br />,
            cur,
          ]);
        }) },
        { title: 'Tier', field: 'tier', type: 'numeric' },
        { title: 'Notes', field: 'notes', filtering: false },
      ]}
      data={ props.items }
      title="Items"
      options={ { paging: false, filtering: true } }
    />
  );
}
