import React from 'react';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { TabPanel, TabContext, TabList } from '@material-ui/lab';

import { PlayerTable, ItemTable } from './modules/Tables.js';
import { LoginDialog, SignupDialog, LogoutDialog } from './modules/Dialogs.js';

import wowlogo from './wowlogo.png'
import './App.scss';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1565c0',
    },
    secondary: {
      main: '#f8b700',
    },
  },
});

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tabValue: "2",
      loggedInPlayer: null,
      items: [],
      players: [],
      lootHistory: [],
      raids: [],
      raidDays: [],
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
    fetch('/api/getItems').then(res => res.json()).then(data => {
      for (const item of data) {
        const oldItem = this.state.items.find(i => i.id === item.id);
        if (oldItem) {
          item.tableData = oldItem.tableData;
        }
      }
      this.setState({items: data})
    });
  }

  getPlayers() {
    fetch('/api/getPlayers').then(res => res.json()).then(data => {
      for (const player of data) {
        const oldPlayer = this.state.players.find(p => p.id === player.id);
        if (oldPlayer) {
          player.tableData = oldPlayer.tableData;
        }
      }
      this.setState({players: data})
    });
  }

  getLootHistory() {
    fetch('/api/getLootHistory').then(res => res.json()).then(data => {
      this.setState({lootHistory: data})
    });
  }

  getRaids() {
    fetch('/api/getRaids').then(res => res.json()).then(data => {
      this.setState({raids: data.raids, raidDays: data.raid_days})
    });
  }

  getCurrentUser() {
    fetch('/api/getCurrentUser').then(res => res.json()).then(data => {
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
      <ThemeProvider theme={theme}>
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
                           raidDays={this.state.raidDays}
                           lootHistory={this.state.lootHistory}
                           updateRemoteData={this.updateRemoteData}
              />
            </TabPanel>
            <TabPanel value="2">
              <ItemTable loggedInPlayer={this.state.loggedInPlayer}
                         players={this.state.players}
                         items={this.state.items}
                         raids={this.state.raids}
                         raidDays={this.state.raidDays}
                         lootHistory={this.state.lootHistory}
                         updateRemoteData={this.updateRemoteData}
              />
            </TabPanel>
          </TabContext>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
