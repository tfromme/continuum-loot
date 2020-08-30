import React from 'react';

import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { TabPanel, TabContext, TabList } from '@material-ui/lab';

import { PlayerTable, ItemTable } from './modules/Tables.js';

import wowlogo from './wowlogo.png'
import './App.scss';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {tabValue: "1", items: [], players: [], loot_history: [], raids: [], raid_days: []};
    this.handleTabValueChange = this.handleTabValueChange.bind(this);
  }

  componentDidMount() {
    fetch('/getItems').then(res => res.json()).then(data => {
      this.setState({items: data})
    });

    fetch('/getPlayers').then(res => res.json()).then(data => {
      this.setState({players: data})
    });

    fetch('/getLootHistory').then(res => res.json()).then(data => {
      this.setState({loot_history: data})
    });

    fetch('/getRaids').then(res => res.json()).then(data => {
      this.setState({raids: data.raids, raid_days: data.raid_days})
    });
  }

  handleTabValueChange(e, v) {
    this.setState({tabValue: v});
  }

  render() {
    return (
      <>
        <div className="header-logo">
          <img src={wowlogo} alt="WoW Logo" />
          <span>Welcome to the Continuum Master Loot App</span>
        </div>
        <div>
          <TabContext value={this.state.tabValue}>
            <AppBar position="static">
              <TabList onChange={this.handleTabValueChange}>
                <Tab label="Players" value="1" />
                <Tab label="Items" value="2" />
              </TabList>
            </AppBar>
            <TabPanel value="1">
              <PlayerTable players={this.state.players} />
            </TabPanel>
            <TabPanel value="2">
              <ItemTable items={this.state.items} raids={this.state.raids}/>
            </TabPanel>
          </TabContext>
        </div>
      </>
    );
  }
}

export default App;
