from flask import Flask, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

import dbinterface

app = Flask(__name__)
app.secret_key = 'secret'


@app.route('/getPlayers', methods=['GET'])
def getPlayers():
    players, _ = dbinterface.load_players()
    return jsonify([player.to_dict() for player in players.values()])


@app.route('/getItems', methods=['GET'])
def getItems():
    items = dbinterface.load_items()
    return jsonify([item.to_dict() for item in items.values()])


@app.route('/getRaids', methods=['GET'])
def getRaids():
    raids, raid_days = dbinterface.load_raids_and_raid_days()
    return jsonify({
        'raids': [raid.to_dict() for raid in raids.values()],
        'raid_days': [raid_day.to_dict() for raid_day in raid_days.values()]
    })


@app.route('/getLootHistory', methods=['GET'])
def getLootHistory():
    loot_history = dbinterface.load_loot_history()
    return jsonify([line.to_dict() for line in loot_history.values()])


@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    _, users = dbinterface.load_players()
    player_name = data.get('player_name', '').lower().capitalize()
    matching_users = [user for user in users.values() if user.name == player_name]

    if data['new'] and len(matching_users) == 0:
        current_user = dbinterface.new_user(player_name, generate_password_hash(data['password']),
                                            0, '', data['class'], data['role'], 'Member')
    elif data['new'] and matching_users[0].exists:
        return jsonify({'error': 'Character Already Signed Up'})
    elif not data['new'] and users.get(data['player_id']) is not None and users[data['player_id']].exists:
        return jsonify({'error': 'Character Already Signed Up'})
    else:
        current_user = dbinterface.set_password_hash(data['player_id'], generate_password_hash(data['password']))

    return login(current_user, data['password'])


@app.route('/login', methods=['POST'])
def login(current_user=None, password=None):
    if current_user is None:
        data = request.json
        _, users = dbinterface.load_players()
        player_name = data['player_name'].lower().capitalize()
        matching_users = [user for user in users.values() if user.name == player_name]

        if len(matching_users) == 0:
            return jsonify({'error': 'Character Does Not Exist'})
        else:
            current_user = matching_users[0]
            password = data['password']

    if (check_password_hash(current_user.password_hash, password)):
        session.clear()
        session['user_id'] = current_user.id
        return jsonify({'player': current_user.to_dict()})
    else:
        return jsonify({'error': 'Incorrect Password'})


@app.route('/logout', methods=['GET'])
def logout():
    session.clear()
    return '', 204


@app.route('/getCurrentUser', methods=['GET'])
def getCurrentUser():
    try:
        if 'user_id' in session:
            _, users = dbinterface.load_players()
            current_user = users[session['user_id']]
            return jsonify({'player': current_user.to_dict()})
    except KeyError:  # User no longer exists
        session.clear()

    return jsonify({'player': None})
