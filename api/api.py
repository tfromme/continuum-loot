from flask import Flask, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

import dbinterface
from models import Player

app = Flask(__name__)
app.secret_key = 'secret'


@app.route('/api/getPlayers', methods=['GET'])
def getPlayers():
    players, _ = dbinterface.load_players()
    return jsonify([player.to_dict() for player in players.values()])


@app.route('/api/getItems', methods=['GET'])
def getItems():
    items = dbinterface.load_items()
    return jsonify([item.to_dict() for item in items.values()])


@app.route('/api/getRaids', methods=['GET'])
def getRaids():
    raids, raid_days = dbinterface.load_raids_and_raid_days()
    return jsonify({
        'raids': [raid.to_dict() for raid in raids.values()],
        'raid_days': [raid_day.to_dict() for raid_day in raid_days.values()]
    })


@app.route('/api/getLootHistory', methods=['GET'])
def getLootHistory():
    loot_history = dbinterface.load_loot_history()
    return jsonify([line.to_dict() for line in loot_history.values()])


@app.route('/api/signup', methods=['POST'])
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


@app.route('/api/login', methods=['POST'])
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


@app.route('/api/logout', methods=['GET'])
def logout():
    session.clear()
    return '', 204


@app.route('/api/getCurrentUser', methods=['GET'])
def getCurrentUser():
    try:
        if 'user_id' in session:
            _, users = dbinterface.load_players()
            current_user = users[session['user_id']]
            return jsonify({'player': current_user.to_dict()})
    except KeyError:  # User no longer exists
        session.clear()

    return jsonify({'player': None})


@app.route('/api/updatePlayer', methods=['POST'])
def updatePlayer():
    data = request.json
    try:
        player_id = data['player']['id']
    except KeyError:
        return 'Invalid Request Body', 400

    if 'user_id' not in session:
        return 'Not Allowed', 400
    else:
        current_user = dbinterface.load_user_by_id(session['user_id'])

    # TODO: Remove hardcoded permission levels
    if current_user.permission_level < 2 and current_user.id != player_id:
        return 'Not Allowed', 400

    current_player = dbinterface.load_player_by_id(player_id)
    updated_player = Player.from_dict(data['player'])

    # Only admins can update name/class/rank/attendance
    if current_user.permission_level < 2:  # Admin
        updated_player.name = current_player.name
        updated_player.player_class = current_player.player_class
        updated_player.rank = current_player.rank
        updated_player.attendance = current_player.attendance

    dbinterface.update_player_information(current_player, updated_player)
    return '', 204
