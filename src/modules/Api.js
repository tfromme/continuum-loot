export function postApi(path, data) {
  return fetch(path, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(res => {
    if (!res.ok) {
      return {'error': '' + res.status + ': ' + res.statusText};
    } else if (res.status === 204) {
      return {'json': ''};
    } else {
      return {'json': res.json()};
    }
  })
}

function updatePlayer(player, updateRemoteData) {
  postApi('/api/updatePlayer', {'player': player}).then(_res => {
    updateRemoteData('players');
  });
}

function updateItem(item, updateRemoteData) {
  postApi('/api/updateItem', {'item': item}).then(_res => {
    updateRemoteData('items');
  });
}

function updateLootHistory(lh, updateRemoteData) {
  postApi('/api/updateLootHistory', {'row': lh}).then(_res => {
    updateRemoteData('lootHistory');
  });
}

function addLootHistory(lh, updateRemoteData) {
  postApi('/api/addLootHistory', {'row': lh}).then(_res => {
    updateRemoteData('lootHistory');
  });
}

function deleteLootHistory(lh, updateRemoteData) {
  postApi('/api/deleteLootHistory', {'id': lh.id}).then(_res => {
    updateRemoteData('lootHistory');
  });
}

const Api = {
  player: {
    update: updatePlayer,
  },
  item: {
    update: updateItem,
  },
  lootHistory: {
    add: addLootHistory,
    update: updateLootHistory,
    delete: deleteLootHistory,
  },
};

export default Api;
