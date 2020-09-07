import React from 'react';
import MaterialTable from 'material-table'

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
  const columnsEditable = props.loggedInPlayer && props.loggedInPlayer.permission_level >= 2 ? 'always' : 'never'
  const rowsEditable = rowData => (props.loggedInPlayer
                                   ? (rowData.id === props.loggedInPlayer.id || props.loggedInPlayer.permission_level >= 2)
                                   : false)

  return (
    <MaterialTable
      columns={[
        { title: 'Name', field: 'name', defaultSort: 'asc', editable: columnsEditable },
        { title: 'Class', field: 'class', lookup: arrayToObj(classes), editable: columnsEditable },
        { title: 'Rank', field: 'rank', lookup: arrayToObj(ranks), editable: columnsEditable },
        { title: 'Role', field: 'role', lookup: arrayToObj(roles) },
        { title: 'Notes', field: 'notes', filtering: false },
      ]}
      data={ props.players }
      title="Players"
      options={ { paging: false, filtering: true } }
      editable={ {
        isEditable: rowsEditable,
        isEditHidden: rowData => !rowsEditable(rowData),
        onRowUpdate: (newData, oldData) => {
          return new Promise((resolve, reject) => {
            updatePlayer(newData, props.updateRemoteData);
            resolve();
          });
        },
      } }
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
