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
  return postApi('/api/updatePlayer', {'player': player}).then(_res => {
    updateRemoteData('players');
  });
}

function updateItem(item, updateRemoteData) {
  return postApi('/api/updateItem', {'item': item}).then(_res => {
    updateRemoteData('items');
  });
}

function updateLootHistory(lh, updateRemoteData) {
  return postApi('/api/updateLootHistory', {'row': lh}).then(_res => {
    updateRemoteData('lootHistory');
  });
}

function addLootHistory(lh, updateRemoteData) {
  return postApi('/api/addLootHistory', {'row': lh}).then(_res => {
    updateRemoteData('lootHistory');
  });
}

function deleteLootHistory(lh, updateRemoteData) {
  return postApi('/api/deleteLootHistory', {'id': lh.id}).then(_res => {
    updateRemoteData('lootHistory');
  });
}

function updateUser(user, updateRemoteData) {
  return postApi('/api/updateUser', {'user': user}).then(_res => {
    updateRemoteData('users', 'currentUser');
  });
}

function resetUserPassword(user) {
  return postApi('/api/resetUserPassword', {'user': user});
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
  user: {
    update: updateUser,
    resetPassword: resetUserPassword,
  }
};

export default Api;
