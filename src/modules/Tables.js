import React from 'react';
import MaterialTable from 'material-table';
import HowToRegOutlined from '@material-ui/icons/HowToRegOutlined';
import AssignmentOutlined from '@material-ui/icons/AssignmentOutlined';

import { classes, ranks, roles } from './Constants.js';
import { updatePlayer, updateItem } from './Api.js';
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
        onRowUpdate: (newData, oldData) => {
          return new Promise((resolve, reject) => {
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

export function ItemTable(props) {
  const rowEditable = props.loggedInPlayer && props.loggedInPlayer.permission_level >= 1;

  var raidShortNameLookup = {};
  for (const raid of props.raids) {
    raidShortNameLookup[raid.id] = raid.short_name;
  }

  const [ columns ] = React.useState([
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

  return (
    <MaterialTable
      columns={columns}
      data={ props.items }
      title="Items"
      options={ { paging: false, filtering: true } }
      localization={{header: {actions: ''}}}
      editable={ {
        isEditable: rowData => rowEditable,
        isEditHidden: rowData => !rowEditable,
        onRowUpdate: (newData, oldData) => {
          return new Promise((resolve, reject) => {
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
