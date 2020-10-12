import React from 'react';
import PropTypes from 'prop-types';

import { useTable, useSortBy } from 'react-table';
import MaterialTable from 'material-table';
import HowToRegOutlined from '@material-ui/icons/HowToRegOutlined';
import AssignmentOutlined from '@material-ui/icons/AssignmentOutlined';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import CustomPropTypes from './CustomPropTypes.js';
import Api from './Api.js';
import { classes, ranks, roles, itemTiers, itemCategories } from './Constants.js';
import { WishlistRow, AttendanceRow, LootHistoryRow, PriorityRow, LootHistoryItemsRow } from './DetailRows.js';
import { EditItemAutocomplete } from './EditComponents.js';
import { RaidFilter, MultiselectFilter } from './Filters.js';


function rowStyleFun(data, index) {
  if (index % 2) {
    return { backgroundColor: "#EEE" };
  }
}

export function PlayerTable(props) {
  const fullEditable = props.loggedInPlayer && props.loggedInPlayer.permission_level >= 2 ? 'always' : 'never';
  const rowEditable = rowData => {
    if (props.loggedInPlayer) {
      if (props.loggedInPlayer.permission_level >= 1
       || rowData.id === props.loggedInPlayer.id
       || rowData.alts.includes(props.loggedInPlayer.id)
      ) {
        return true;
      }
    }
    return false;
  }

  const [ columns ] = React.useState([
    { title: 'Name', field: 'name', filtering: false, defaultSort: 'asc', editable: fullEditable },
    { title: 'Class', field: 'class', lookup: classes, editable: fullEditable },
    { title: 'Rank', field: 'rank', lookup: ranks, editable: fullEditable },
    { title: 'Role', field: 'role', lookup: roles },
    { title: 'Notes', field: 'notes', filtering: false },
  ]);

  return (
    <MaterialTable
      columns={columns}
      data={ props.players.filter(player => player.is_active) }
      title="Players"
      options={ { padding: 'dense', paging: false, filtering: true, draggable: false, rowStyle: rowStyleFun } }
      localization={{header: {actions: ''}}}
      editable={ {
        isEditable: rowEditable,
        isEditHidden: rowData => !rowEditable(rowData),
        onRowUpdate: (newData, _oldData) => {
          return new Promise((resolve, _reject) => {
            Api.player.update(newData, props.updateRemoteData);
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
              players={props.players}
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

  var choices = props.raids.map(raid => "All " + raid.short_name);
  for (const raid of props.raids) {
    for (const boss of raid.bosses) {
      choices.push(boss);
    }
  }

  const defaultFilter = [choices[0]];

  const bossFilter = xProps => <MultiselectFilter initialValue={defaultFilter} choices={choices} {...xProps} />;

  const bossSearch = (selected, rowData) => {
    if (selected.length === 0) {
      return true;
    }

    for (const choice of selected) {
      const raid = props.raids.find(x => "All " + x.short_name === choice);
      // Could be raid name
      if (raid && raid.id === rowData.raid) {
        return true;
      }
      // else its a boss name
      if (rowData.bosses.includes(choice)) {
        return true;
      }
    }

    return false;
  }

  var playerLookup = {};
  for (const player of props.players) {
    playerLookup[player.id] = player.name;
  }

  const [ columns ] = React.useState([
    { title: 'Name', field: 'name', defaultSort: 'asc', editable: 'never',
      render: ( rowData => <a href={rowData.link}>{rowData.name}</a> )},
    { title: 'Bosses', field: 'bosses', defaultFilter: defaultFilter, editable: 'never',
      filterComponent: bossFilter, customFilterAndSearch: bossSearch,
      render: ((rowData) => {
        return rowData.bosses.reduce((all, cur, index) => [
          ...all,
          <br key={index}/>,
          cur,
        ]);
      })
    },
    { title: 'Tier', field: 'tier', type: 'numeric' },
    { title: 'Category', field: 'category', lookup: itemCategories },
    { title: 'Prio 1', field: 'iprio_1', lookup: playerLookup, editable: 'never', filtering: false },
    { title: 'Prio 2', field: 'iprio_2', lookup: playerLookup, editable: 'never', filtering: false },
    { title: 'Class Prio 1', field: 'cprio_1', editable: 'never', filtering: false },
    { title: 'Notes', field: 'notes', filtering: false },
  ]);

  return (
    <MaterialTable
      columns={columns}
      data={ props.items }
      title="Items"
      options={ { padding: 'dense', paging: false, filtering: true, rowStyle: rowStyleFun } }
      localization={{header: {actions: ''}}}
      editable={ {
        isEditable: _ => rowEditable,
        isEditHidden: _ => !rowEditable,
        onRowUpdate: (newData, _oldData) => {
          return new Promise((resolve, _reject) => {
            Api.item.update(newData, props.updateRemoteData);
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



export function LootHistoryTable(props) {
  const rowEditable = props.loggedInPlayer && props.loggedInPlayer.permission_level >= 2;

  const raidDaySort = React.useCallback(
    (a, b) => {
      const raidDayA = props.raidDays.find(x => x.id === a.original.raid_day_id);
      const raidDayB = props.raidDays.find(x => x.id === b.original.raid_day_id);
      return Date.parse(raidDayA.date) - Date.parse(raidDayB.date);
    },
    [props.raidDays]
  );

  const data = React.useMemo(() => props.lootHistory, [props.lootHistory]);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Raid',
        accessor: row => props.raidDays.find(x => x.id === row.raid_day_id).name,
        id: 'raid_day',
        sortType: raidDaySort,
        sortDescFirst: true,
      },
      {
        Header: 'Name',
        accessor: row => props.players.find(x => x.id === row.player_id).name,
        id: 'player',
        sortType: 'basic',
      },
      {
        Header: 'Class',
        accessor: row => classes[props.players.find(x => x.id === row.player_id).class],
        id: 'player_class',
        sortType: 'basic',
      },
      {
        Header: 'Role',
        accessor: row => roles[props.players.find(x => x.id === row.player_id).role],
        id: 'player_role',
        sortType: 'basic',
      },
      {
        Header: 'Item',
        accessor: row => props.items.find(x => x.id === row.item_id).name,
        id: 'item',
        sortType: 'basic',
      },
      {
        Header: 'Item Tier',
        accessor: row => props.items.find(x => x.id === row.item_id).tier,
        id: 'item_tier',
        sortType: 'basic',
      },
    ],
    [props.raidDays, props.items, props.players, raidDaySort]
  )

  const tableInstance = useTable({ columns, data }, useSortBy);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance

  return (
    <TableContainer component={Paper}>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? <ArrowDownward /> : <ArrowUpward />) : ''}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            const rowProps = row.getRowProps();
            if (index % 2) {
              rowProps.style = { backgroundColor: "#EEE" };
            }
            return (
              <TableRow { ...rowProps}>
                {row.cells.map(cell => (
                  <TableCell {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  /*
  const raidDaySearch = (term, rowData) => {
    const raidDay = props.raidDays.find(x => x.id === rowData.raid_day_id);
    return term.length === 0 || term.includes(raidDay.raid_id);
  }

  const classFilter = props => <MultiselectFilter choices={Object.values(classes)}
                                                  {...props} />;
  const roleFilter = props => <MultiselectFilter choices={Object.values(roles)}
                                                 {...props} />;
  const tierFilter = props => <MultiselectFilter choices={itemTiers} {...props} />;

  const classSearch = (term, rowData) => {
    const player = props.players.find(x => x.id === rowData.player_id);
    return term.length === 0 || term.includes(classes[player.class]);
  }

  const roleSearch = (term, rowData) => {
    const player = props.players.find(x => x.id === rowData.player_id);
    return term.length === 0 || term.includes(roles[player.role]);
  }

  const tierSearch = (term, rowData) => {
    const item = props.items.find(x => x.id === rowData.item_id);
    return term.length === 0 || term.includes(item.tier);
  }

  const editNameComponent = xProps => (
    <EditItemAutocomplete
      items={props.players}
      initialValue={props.players.find(x => x.id === xProps.rowData.player_id)}
      onChange={xProps.onChange}
    />
  );

  const editItemComponent = xProps => (
    <EditItemAutocomplete
      items={props.items}
      initialValue={props.items.find(x => x.id === xProps.rowData.item_id)}
      onChange={xProps.onChange}
    />
  );

  const [ columns ] = React.useState([
    { title: 'Raid', field: 'raid_day_id', lookup: raidDayLookup, defaultSort: 'desc',
      customSort: raidDaySort, filterComponent: RaidFilter, customFilterAndSearch: raidDaySearch },
    { title: 'Name', field: 'player_id', lookup: nameLookup, editComponent: editNameComponent },
    { title: 'Class', field: 'player_id', lookup: classLookup, editable: 'never',
      filterComponent: classFilter, customFilterAndSearch: classSearch },
    { title: 'Role', field: 'player_id', lookup: roleLookup, editable: 'never',
      filterComponent: roleFilter, customFilterAndSearch: roleSearch },
    { title: 'Item', field: 'item_id', lookup: itemLookup, editComponent: editItemComponent },
    { title: 'Item Tier', field: 'item_id', lookup: tierLookup, editable: 'never',
      filterComponent: tierFilter, customFilterAndSearch: tierSearch },
  ]);

  return (
    <MaterialTable
      columns={columns}
      data={ props.lootHistory }
      title="Loot History"
      options={ { padding: 'dense', paging: false, filtering: true, draggable: false,
                  addRowPosition: 'first', rowStyle: rowStyleFun } }
      localization={{header: {actions: ''}}}
      editable={ {
        isEditable: _ => rowEditable,
        isEditHidden: _ => !rowEditable,
        isDeletable: _ => rowEditable,
        isDeleteHidden: _ => !rowEditable,
        onRowUpdate: (newData, _oldData) => {
          return new Promise((resolve, _reject) => {
            Api.lootHistory.update(newData, props.updateRemoteData);
            resolve();
          });
        },
        // This ternary is because there is no `isAddable` prop
        // it hides add button when user doesnt have permission
        onRowAdd: rowEditable ? (newData => {
          return new Promise((resolve, _reject) => {
            Api.lootHistory.add(newData, props.updateRemoteData);
            resolve();
          });
        }) : false,
        onRowDelete: oldData => {
          return new Promise((resolve, _reject) => {
            Api.lootHistory.delete(oldData, props.updateRemoteData);
            resolve();
          });
        },
      } }
    />
  );
    */
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
