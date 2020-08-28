import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';


function createData(name, class_, rank, role, notes) {
  return { name, class_, rank, role, notes };
}

export class PlayerTable extends React.Component {
  playersToRows() {
    var rows = [];
    var players = this.props.players;
    for (const player in players) {
      rows.push(createData(
        players[player].name,
        players[player].class,
        players[player].rank,
        players[player].role,
        players[player].notes,
      ));
    }
    return rows;
  }

  render() {
    const headers = ['Name', 'Class', 'Rank', 'Role', 'Notes'];
    const headerItems = headers.map((header, index) =>
      <TableCell key={index}>{header}</TableCell>
    );

    const rows = this.playersToRows().map((row) =>
      <TableRow key={row.name}>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell>{row.class_}</TableCell>
        <TableCell>{row.rank}</TableCell>
        <TableCell>{row.role}</TableCell>
        <TableCell>{row.notes}</TableCell>
      </TableRow>
    );
    return (
      <TableContainer component={Paper}>
        <Table className="table">
          <TableHead>
            <TableRow>
              {headerItems}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}
