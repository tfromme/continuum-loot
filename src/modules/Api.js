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
    } else {
      return {'json': res.json()};
    }
  })
}
