import React from 'react';

import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { TabPanel, TabContext, TabList } from '@material-ui/lab';

import { PlayerTable, ItemTable } from './modules/Tables.js';
import { LoginDialog, SignupDialog, LogoutDialog } from './modules/Dialogs.js';

import wowlogo from './wowlogo.png'
import './App.scss';


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tabValue: "1",
      loggedInPlayer: null,
      items: [],
      players: [],
      loot_history: [],
      raids: [],
      raid_days: [],
    };
    this.handleTabValueChange = this.handleTabValueChange.bind(this);
    this.setLoggedInPlayer = this.setLoggedInPlayer.bind(this);
    this.updateRemoteData = this.updateRemoteData.bind(this);
  }

  updateRemoteData(...data) {
    const data_mapping = {
      'items': this.getItems.bind(this),
      'players': this.getPlayers.bind(this),
      'lootHistory': this.getLootHistory.bind(this),
      'raids': this.getRaids.bind(this),
      'currentUser': this.getCurrentUser.bind(this),
    }

    for (const key of data) {
      data_mapping[key]();
    }
  }

  getItems() {
    fetch('/getItems').then(res => res.json()).then(data => {
      this.setState({items: data})
    });
  }

  getPlayers() {
    fetch('/getPlayers').then(res => res.json()).then(data => {
      this.setState({players: data})
    });
  }

  getLootHistory() {
    fetch('/getLootHistory').then(res => res.json()).then(data => {
      this.setState({loot_history: data})
    });
  }

  getRaids() {
    fetch('/getRaids').then(res => res.json()).then(data => {
      this.setState({raids: data.raids, raid_days: data.raid_days})
    });
  }

  getCurrentUser() {
    fetch('/getCurrentUser').then(res => res.json()).then(data => {
      this.setState({loggedInPlayer: data.player})
    });
  }

  componentDidMount() {
    this.getItems();
    this.getPlayers();
    this.getLootHistory();
    this.getRaids();
    this.getCurrentUser();
  }

  handleTabValueChange(e, v) {
    this.setState({tabValue: v});
  }

  setLoggedInPlayer(v) {
    this.setState({loggedInPlayer: v});
  }

  render() {
    // This array nonsense is used instead of React Fragments because material-ui likes it that way
    const tabs = [
      <Tab key="0" label="Players" value="1" />,
      <Tab key="1" label="Items" value="2" />
    ];

    var loginButtons = [
      <LoginDialog key="10" setLoggedInPlayer={this.setLoggedInPlayer} />,
      <SignupDialog key="11" players={this.state.players} setLoggedInPlayer={this.setLoggedInPlayer}
                    updateRemoteData={this.updateRemoteData} />
    ];
    
    var headerText = 'Welcome to the Continuum Master Loot App';

    if (this.state.loggedInPlayer !== null) {
      loginButtons = [ <LogoutDialog key="20" setLoggedInPlayer={this.setLoggedInPlayer} /> ];
      headerText = 'Welcome, ' + this.state.loggedInPlayer.name;
    }

    return (
      <>
        <div className="header-logo">
          <img src={wowlogo} alt="WoW Logo" />
          <span>{headerText}</span>
        </div>
        <div>
          <TabContext value={this.state.tabValue}>
            <AppBar position="static">
              <TabList onChange={this.handleTabValueChange}>
                {tabs.concat(loginButtons)}
              </TabList>
            </AppBar>
            <TabPanel value="1">
              <PlayerTable loggedInPlayer={this.state.loggedInPlayer}
                           players={this.state.players}
                           items={this.state.items}
                           updateRemoteData={this.updateRemoteData}
              />
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
