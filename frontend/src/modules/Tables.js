import React from 'react';
import PropTypes from 'prop-types';

import { useTable, useSortBy, useFilters, useRowState } from 'react-table';
import MaterialTable from 'material-table';
import HowToRegOutlined from '@material-ui/icons/HowToRegOutlined';
import AssignmentOutlined from '@material-ui/icons/AssignmentOutlined';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Edit from '@material-ui/icons/Edit';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Check from '@material-ui/icons/Check';
import Clear from '@material-ui/icons/Clear';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import CustomPropTypes from './CustomPropTypes.js';
import Api from './Api.js';
import { classes, ranks, roles, itemTiers, itemCategories } from './Constants.js';
import { WishlistRow, AttendanceRow, LootHistoryRow, PriorityRow, LootHistoryItemsRow } from './DetailRows.js';
import { EditCellAutocomplete, EditCellSelect } from './EditComponents.js';
import { TextFilter, MultiselectFilter, OldMultiselectFilter } from './Filters.js';


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

  const bossFilter = xProps => <OldMultiselectFilter initialValue={defaultFilter} choices={choices} {...xProps} />;

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

  const filterInArray = React.useCallback(
    (rows, id, filterValue) => (
      rows.filter(row => filterValue.includes(row.values[id]))
    ),
    []
  );

  const data = React.useMemo(() => props.lootHistory, [props.lootHistory]);

  const buttons = ({row}) => {
    if (row.state.editing) {
      console.log(row)
      return (
        <>
          <Tooltip title="Save">
            <IconButton size='small' onClick={() => row.setState({editing: false})}>
              <Check />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton size='small' onClick={() => row.setState({editing: false})}>
              <Clear />
            </IconButton>
          </Tooltip>
        </>
      );
    } else {
      return (
        <>
          <Tooltip title="Edit">
            <IconButton size='small' onClick={() => {
              row.setState({editing: true, values: {...row.original}})
            }}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size='small' onClick={() => row.setState({editing: true})}>
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </>
      );
    }
  };

  const columns = React.useMemo(
    () => [
      {
        id: 'buttons',
        Cell: buttons,
      },
      {
        Header: 'Raid',
        accessor: row => props.raidDays.find(x => x.id === row.raid_day_id).name,
        id: 'raid_day_id',
        sortType: raidDaySort,
        sortDescFirst: true,
        Filter: TextFilter,
        Cell: EditCellSelect.bind(null, props.raidDays),
      },
      {
        Header: 'Name',
        accessor: row => props.players.find(x => x.id === row.player_id).name,
        id: 'player_id',
        sortType: 'basic',
        Filter: TextFilter,
      },
      {
        Header: 'Class',
        accessor: row => classes[props.players.find(x => x.id === row.player_id).class],
        id: 'player_class',
        disableSortBy: true,
        Filter: MultiselectFilter.bind(null, Object.values(classes)),
        filter: filterInArray,
      },
      {
        Header: 'Role',
        accessor: row => roles[props.players.find(x => x.id === row.player_id).role],
        id: 'player_role',
        disableSortBy: true,
        Filter: MultiselectFilter.bind(null, Object.values(roles)),
        filter: filterInArray,
      },
      {
        Header: 'Item',
        accessor: row => props.items.find(x => x.id === row.item_id).name,
        id: 'item_id',
        sortType: 'basic',
        Filter: TextFilter,
      },
      {
        Header: 'Item Tier',
        accessor: row => props.items.find(x => x.id === row.item_id).tier,
        id: 'item_tier',
        disableSortBy: true,
        Filter: MultiselectFilter.bind(null, itemTiers),
        filter: filterInArray,
        randomThing: 'test_val',
      },
    ],
    [props.raidDays, props.items, props.players, raidDaySort, filterInArray]
  )

  const tableInstance = useTable({ columns, data }, useRowState, useFilters, useSortBy);

  const {
    // state,   TODO: Pop this up to App and pass down as "initialState" to save state between tabs
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
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
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

  return (
    <MaterialTable
      editable={ {
        isEditable: _ => rowEditable,
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
