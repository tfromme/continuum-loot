import React from 'react';
import MaterialTable from 'material-table'

function arrayToObj(arr) {
  var obj = {}
  for (const item of arr) {
    obj[item] = item;
  }
  return obj;
}

export function PlayerTable(props) {
  var classes = ['Druid', 'Hunter', 'Mage', 'Paladin', 'Priest', 'Rogue', 'Warlock', 'Warrior'];
  var ranks = ['GM', 'Officer', 'Class Lead', 'Core Raider', 'Veteran', 'Member', 'Inactive']
  var roles = ['DPS', 'Tank', 'Healer'];

  return (
    <MaterialTable
      columns={[
        { title: 'Name', field: 'name', defaultSort: 'asc' },
        { title: 'Class', field: 'class', lookup: arrayToObj(classes) },
        { title: 'Rank', field: 'rank', lookup: arrayToObj(ranks) },
        { title: 'Role', field: 'role', lookup: arrayToObj(roles) },
        { title: 'Notes', field: 'notes', filtering: false },
      ]}
      data={ props.players }
      title="Players"
      options={ { paging: false, filtering: true } }
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
