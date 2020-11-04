import React from 'react';
import PropTypes from 'prop-types';

import { useTable, useSortBy, useFilters, useRowState, useExpanded } from 'react-table';

import {
  ArrowUpward, ArrowDownward,
  HowToReg, HowToRegOutlined, Favorite, FavoriteBorder,
  Assignment, AssignmentOutlined, WatchLater, History,
  Edit, DeleteOutline, Check, Clear,
} from '@material-ui/icons';

import {
  Toolbar, Typography, Paper, CircularProgress,
  TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Tooltip,
} from '@material-ui/core';

import CustomPropTypes from './CustomPropTypes.js';
import Api from './Api.js';
import { classes, ranks, roles, itemTiers, itemCategories } from './Constants.js';
import { WishlistRow, AttendanceRow, LootHistoryRow, PriorityRow, LootHistoryItemsRow } from './DetailRows.js';
import { BasicCell, EditCellSelect, EditCellText, EditCellAutocomplete } from './EditComponents.js';
import { TextFilter, MultiselectFilter } from './Filters.js';
import { AddLootHistoryDialog } from './ActionDialogs.js';


const cellStyle = {padding: 4, paddingLeft: 8};

const headerStyle = {padding: 16, paddingLeft: 4, paddingRight: 28};

function filterInArray(rows, id, filterValue) {
  return rows.filter(row => filterValue.includes(row.values[id]));
}

function toggleExpanded(row, which) {
  if (row.state.expanded === which) {
    row.setState(old => ({...old, expanded: null}));
    row.toggleRowExpanded(false);
  } else {
    row.setState(old => ({...old, expanded: which}));
    row.toggleRowExpanded(true);
  }
}

export function PlayerTable(props) {
  const fullEditable = React.useMemo(
    () => props.loggedInPlayer && props.loggedInPlayer.permission_level >= 2,
    [props.loggedInPlayer],
  )

  const rowEditable = React.useCallback(
    row => {
      if (props.loggedInPlayer) {
        if (props.loggedInPlayer.permission_level >= 1
         || row.original.id === props.loggedInPlayer.id
         || row.original.alts.includes(props.loggedInPlayer.id)
        ) {
          return true;
        }
      }
      return false;
    },
    [props.loggedInPlayer],
  );

  const onSave = React.useCallback(
    row => {
      Api.player.update(row.state.values, props.updateRemoteData);
    },
    [props.updateRemoteData]
  );

  const expandRowOptions = React.useMemo(
    () => [
      {
        id: 'wishlist',
        tooltip: 'Wishlist',
        icon: FavoriteBorder,
        openIcon: Favorite,
        render: row => (
          <WishlistRow
            rowData={row.original}
            items={props.items}
            updateRemoteData={props.updateRemoteData}
            editable={rowEditable(row)}
          />
        ),
      },
      {
        id: 'attendance',
        tooltip: 'Attendance',
        icon: HowToRegOutlined,
        openIcon: HowToReg,
        render: row => (
          <AttendanceRow
            rowData={row.original}
            players={props.players}
            raidDays={props.raidDays}
          />
        ),
      },
      {
        id: 'loot_history',
        tooltip: 'Recent Loot History',
        icon: History,
        openIcon: WatchLater,
        render: row => (
          <LootHistoryRow
            rowData={row.original}
            lootHistory={props.lootHistory}
            items={props.items}
            raidDays={props.raidDays}
          />
        ),
      },
    ],
    [rowEditable, props.players, props.items, props.raidDays, props.lootHistory, props.updateRemoteData],
  );

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        id: 'name',
        Filter: TextFilter,
        Cell: fullEditable ? EditCellText : BasicCell,
      },
      {
        Header: 'Class',
        accessor: row => classes[row.class],
        id: 'class',
        Filter: MultiselectFilter.bind(null, Object.values(classes)),
        filter: filterInArray,
        Cell: (fullEditable
               ? EditCellSelect.bind(null, Object.entries(classes).map(([k, v]) => ({id: k, name: v})))
               : BasicCell
        ),
      },
      {
        Header: 'Rank',
        accessor: row => ranks[row.rank],
        id: 'rank',
        Filter: MultiselectFilter.bind(null, Object.values(ranks)),
        filter: filterInArray,
        Cell: (fullEditable
               ? EditCellSelect.bind(null, Object.entries(ranks).map(([k, v]) => ({id: k, name: v})))
               : BasicCell
        ),
      },
      {
        Header: 'Role',
        accessor: row => roles[row.role],
        id: 'role',
        Filter: MultiselectFilter.bind(null, Object.values(roles)),
        filter: filterInArray,
        Cell: EditCellSelect.bind(null, Object.entries(roles).map(([k, v]) => ({id: k, name: v}))),
      },
      {
        Header: 'Notes',
        accessor: 'notes',
        id: 'notes',
        disableSortBy: true,
        Filter: TextFilter,
        Cell: EditCellText,
      },
    ],
    [fullEditable]
  )

  const data = React.useMemo(() => props.players.filter(p => p.is_active), [props.players]);

  return (
    <BaseTable
      columns={columns}
      data={data}
      expandRowOptions={expandRowOptions}
      onSave={onSave}
      title="Players"
      rowEditable={rowEditable}
    />
  )
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
  const rowEditable = React.useCallback(
    _row => props.loggedInPlayer && props.loggedInPlayer.permission_level >= 1,
    [props.loggedInPlayer],
  );

  const bossChoices = React.useMemo(
    () => {
      let choices = props.raids.map(raid => "All " + raid.short_name);
      for (const raid of props.raids) {
        for (const boss of raid.bosses) {
          choices.push(boss);
        }
      }
      return choices;
    },
    [props.raids],
  );

  const filterBosses = React.useCallback(
    (rows, id, filterValue) => {
      return rows.filter(row => {
        for (const choice of filterValue) {
          const raid = props.raids.find(x => "All " + x.short_name === choice);
          if (raid && raid.id === row.original.raid) {
            return true;
          }
          // else its a boss name
          if (row.original.bosses.includes(choice)) {
            return true;
          }
        }
        return false;
      })
    },
    [props.raids]
  );

  const onSave = React.useCallback(
    row => {
      Api.item.update(row.state.values, props.updateRemoteData);
    },
    [props.updateRemoteData]
  );

  const expandRowOptions = React.useMemo(
    () => [
      {
        id: 'prio',
        tooltip: 'Wishlist',
        icon: AssignmentOutlined,
        openIcon: Assignment,
        render: row => (
          <PriorityRow
            rowData={row.original}
            players={props.players}
            loggedInPlayer={props.loggedInPlayer}
            updateRemoteData={props.updateRemoteData}
            editable={rowEditable(row)}
          />
        ),
      },
      {
        id: 'loot_history',
        tooltip: 'Recent Loot History',
        icon: History,
        openIcon: WatchLater,
        render: row => (
          <LootHistoryItemsRow
            rowData={row.original}
            lootHistory={props.lootHistory}
            players={props.players}
            raidDays={props.raidDays}
          />
        ),
      },
    ],
    [rowEditable, props.players, props.loggedInPlayer, props.updateRemoteData, props.lootHistory, props.raidDays],
  );

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        id: 'name',
        Filter: TextFilter,
        // eslint-disable-next-line react/prop-types
        Cell: ({row, value}) => (<a href={row.original.link}>{value}</a>),
      },
      {
        Header: 'Bosses',
        accessor: 'bosses',
        id: 'bosses',
        disableSortBy: true,
        Filter: MultiselectFilter.bind(null, bossChoices),
        filter: filterBosses,
        Cell: ({value}) => value.reduce((all, cur, index) => [ ...all, <br key={index}/>, cur]),
      },
      {
        Header: 'Tier',
        accessor: 'tier',
        id: 'tier',
        Filter: MultiselectFilter.bind(null, itemTiers),
        filter: filterInArray,
        Cell: EditCellSelect.bind(null, itemTiers.map(e => ({id: e, name: e}))),
      },
      {
        Header: 'Category',
        accessor: row => itemCategories[row.category],
        id: 'category',
        Filter: MultiselectFilter.bind(null, Object.values(itemCategories)),
        filter: filterInArray,
        Cell: EditCellSelect.bind(null, Object.entries(itemCategories).map(([k, v]) => ({id: k, name: v}))),
      },
      {
        Header: 'Prio 1',
        accessor: row => {
          let player = props.players.find(x => x.id === row.iprio_1);
          return player ? player.name : '';
        },
        id: 'iprio_1',
        disableSortBy: true,
        Filter: TextFilter,
      },
      {
        Header: 'Prio 2',
        accessor: row => {
          let player = props.players.find(x => x.id === row.iprio_2);
          return player ? player.name : '';
        },
        id: 'iprio_2',
        disableSortBy: true,
        Filter: TextFilter,
      },
      {
        Header: 'Class Prio 1',
        accessor: 'cprio_1',
        id: 'cprio_1',
        disableSortBy: true,
        Filter: TextFilter,
      },
      {
        Header: 'Notes',
        accessor: 'notes',
        id: 'notes',
        disableSortBy: true,
        Filter: TextFilter,
        Cell: EditCellText,
      },
    ],
    [props.players, filterBosses, bossChoices]
  )

  const data = React.useMemo(() => props.items, [props.items]);

  return (
    <BaseTable
      columns={columns}
      data={data}
      expandRowOptions={expandRowOptions}
      onSave={onSave}
      title="Items"
      rowEditable={rowEditable}
    />
  )
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
  const rowEditable = React.useCallback(
    _row => props.loggedInPlayer && props.loggedInPlayer.permission_level >= 2,
    [props.loggedInPlayer],
  );

  const raidDaySort = React.useCallback(
    (a, b) => {
      const raidDayA = props.raidDays.find(x => x.id === a.original.raid_day_id);
      const raidDayB = props.raidDays.find(x => x.id === b.original.raid_day_id);
      return Date.parse(raidDayA.date) - Date.parse(raidDayB.date);
    },
    [props.raidDays]
  );

  const onSave = React.useCallback(
    row => {
      Api.lootHistory.update(row.state.values, props.updateRemoteData);
    },
    [props.updateRemoteData]
  );

  const onDelete = React.useCallback(
    row => {
      Api.lootHistory.delete(row.original, props.updateRemoteData);
    },
    [props.updateRemoteData]
  );

  // TODO: Dynamically update derived column values
  const columns = React.useMemo(
    () => [
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
        Cell: EditCellAutocomplete.bind(null, props.players),
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
        Cell: EditCellAutocomplete.bind(null, props.items),
      },
      {
        Header: 'Item Tier',
        accessor: row => props.items.find(x => x.id === row.item_id).tier,
        id: 'item_tier',
        disableSortBy: true,
        Filter: MultiselectFilter.bind(null, itemTiers),
        filter: filterInArray,
      },
    ],
    [props.raidDays, props.items, props.players, raidDaySort]
  )

  const data = React.useMemo(() => props.lootHistory, [props.lootHistory]);

  return (
    <BaseTable
      columns={columns}
      data={data}
      title="Loot History"
      rowEditable={rowEditable}
      rowDeletable={rowEditable}
      onSave={onSave}
      onDelete={onDelete}
      toolbarExtras={
        <AddLootHistoryDialog raidDays={props.raidDays} players={props.players} items={props.items}
                              updateRemoteData={props.updateRemoteData} />
      }
    />
  )
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

function BaseTable(props) {
  const propsOnSave = props.onSave;
  const propsOnDelete = props.onDelete;
  const { rowEditable, rowDeletable, expandRowOptions } = props;

  const onSave = React.useCallback(
    row => (
      () => {
        row.setState(old => ({...old, editing: false}));
        propsOnSave(row);
      }
    ),
    [propsOnSave]
  );

  const onDelete = React.useCallback(
    row => (
      () => {
        propsOnDelete(row);
      }
    ),
    [propsOnDelete]
  );

  const buttons = React.useCallback(
    ({row}) => {
      const expandButtons = expandRowOptions.map(option => {
        let Icon = option.icon;
        let OpenIcon = option.openIcon;
        return (
          <Tooltip key={option.id} title={option.tooltip}>
            <IconButton size='small' onClick={() => toggleExpanded(row, option.id)}>
              {row.state.expanded === option.id ? <OpenIcon /> : <Icon />}
            </IconButton>
          </Tooltip>
        );
      });

      const deleteButton = rowDeletable(row) ? (
        <Tooltip key="delete" title="Delete">
          <IconButton size='small' onClick={onDelete(row)}>
            <DeleteOutline />
          </IconButton>
        </Tooltip>
      ) : null;

      if (rowEditable(row)) {
        if (row.state.editing) {
          const editingButtons = [
            (
              <Tooltip key="save" title="Save">
                <IconButton size='small' onClick={onSave(row)}>
                  <Check />
                </IconButton>
              </Tooltip>
            ),
            (
              <Tooltip key="cancel" title="Cancel">
                <IconButton size='small' onClick={() => row.setState(old => ({...old, editing: false}))}>
                  <Clear />
                </IconButton>
              </Tooltip>
            ),
          ];
          return [...expandButtons, ...editingButtons];
        } else {
          const editButton = (
            <Tooltip key="edit" title="Edit">
              <IconButton size='small' onClick={() => {
                row.setState(old=> ({...old, editing: true, values: {...row.original}}))
              }}>
                <Edit />
              </IconButton>
            </Tooltip>
          );
          return [...expandButtons, editButton, deleteButton];
        }
      }
      return [...expandButtons, deleteButton];
    },
    [rowEditable, rowDeletable, onSave, onDelete, expandRowOptions],
  );

  const renderExpandedRow = React.useCallback(
    row => {
      const currentOption = expandRowOptions.find(o => o.id === row.state.expanded);
      if (!currentOption) {
        return 'Error'
      }
      return currentOption.render(row)
    },
    [expandRowOptions],
  );

  const columns = React.useMemo(
    () => [{id: 'buttons', Cell: buttons}, ...props.columns],
    [props.columns, buttons],
  );

  let args = [useRowState, useFilters, useSortBy];
  if (expandRowOptions) {
    args = [...args, useExpanded]
  }

  const tableInstance = useTable(
    {
      columns,
      data: props.data,
      autoResetExpanded: false,
      autoResetRowState: false,
      autoResetFilters: false,
      autoResetSortBy: false,
    },
    ...args,
  );

  const {
    // state,   TODO: Pop this up to App and pass down as "initialState" to save state between tabs
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns,
  } = tableInstance

  if (rows.length === 0) {
    return <CircularProgress />;
  }

  /* eslint-disable react/jsx-key */
  return (
    <TableContainer component={Paper}>
      <Toolbar>
        <Typography variant="h6">{props.title}</Typography>
        {props.toolbarExtras}
      </Toolbar>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps({...column.getSortByToggleProps(), style: headerStyle})}>
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
              <React.Fragment key={rowProps.key}>
                <TableRow { ...rowProps}>
                  {row.cells.map(cell => (
                    <TableCell {...cell.getCellProps({style: cellStyle})}>
                      {cell.render('Cell')}
                    </TableCell>
                  ))}
                </TableRow>
                {row.isExpanded ? (
                  <TableRow style={rowProps.style}>
                    <TableCell colSpan={visibleColumns.length} style={{padding: 0}}>
                      {renderExpandedRow(row)}
                    </TableCell>
                  </TableRow>
                ): null}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
  /* eslint-enable react/jsx-key */
}

BaseTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  toolbarExtras: PropTypes.node,
  expandRowOptions: PropTypes.array,
  rowEditable: PropTypes.func,
  rowDeletable: PropTypes.func,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
}

BaseTable.defaultProps = {
  rowEditable: _row => false,
  rowDeletable: _row => false,
  onSave: _row => null,
  onDelete: _row => null,
  toolbarExtras: null,
  expandRowOptions: [],
}
