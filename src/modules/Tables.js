import React from 'react';
import MaterialTable from 'material-table'


export class PlayerTable extends React.Component {
  playersToRows() {
    var rows = [];
    var players = this.props.players;
    for (const player in players) {
      rows.push({
        'name': players[player].name,
        'class': players[player].class,
        'rank': players[player].rank,
        'role': players[player].role,
        'notes': players[player].notes,
      });
    }
    return rows;
  }

  render() {
    return (
      <MaterialTable
        columns={[
          { title: 'Name', field: 'name', defaultSort: 'asc' },
          { title: 'Class', field: 'class' },
          { title: 'Rank', field: 'rank' },
          { title: 'Role', field: 'role' },
          { title: 'Notes', field: 'notes' },
        ]}
        data={ this.playersToRows() }
        title="Players"
        options={ {'paging': false} }
      />
    );
  }
}
