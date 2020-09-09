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

export function updatePlayer(player, updateRemoteData) {
  postApi('/api/updatePlayer', {'player': player}).then(res => {
    updateRemoteData('players');
  });
}
