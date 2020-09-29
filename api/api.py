import json
from flask import Flask, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash
from unidecode import unidecode  # type: ignore

import dbinterface
from utils import str_to_date_ui
from models import Player, User, Item, LootHistoryLine

app = Flask(__name__)
app.secret_key = 'secret'


@app.route('/api/getUsers', methods=['GET'])
def getUsers():
    if 'user_id' not in session:
        return 'Not Allowed', 400
    else:
        current_user = dbinterface.load_user_by_id(session['user_id'])

    # TODO: Remove hardcoded permission levels
    if current_user.permission_level < 2:
        return 'Not Allowed', 400

    _, users = dbinterface.load_players()
    return jsonify([user.to_dict() for user in users.values()])


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


@app.route('/api/updateUser', methods=['POST'])
def updateUser():
    data = request.json
    try:
        user_id = data['user']['id']
    except KeyError:
        return 'Invalid Request Body', 400

    if 'user_id' not in session:
        return 'Not Allowed', 400
    else:
        current_user = dbinterface.load_user_by_id(session['user_id'])

    # TODO: Remove hardcoded permission levels
    if current_user.permission_level < 2:
        return 'Not Allowed', 400

    old_user = dbinterface.load_user_by_id(user_id)
    updated_user = User.from_dict(data['user'])

    dbinterface.update_user_information(old_user, updated_user)
    return '', 204


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


@app.route('/api/updateItem', methods=['POST'])
def updateItem():
    data = request.json
    try:
        item_id = data['item']['id']
    except KeyError:
        return 'Invalid Request Body', 400

    if 'user_id' not in session:
        return 'Not Allowed', 400
    else:
        current_user = dbinterface.load_user_by_id(session['user_id'])

    # TODO: Remove hardcoded permission levels
    if current_user.permission_level < 1:
        return 'Not Allowed', 400

    current_item = dbinterface.load_item_by_id(item_id)
    updated_item = Item.from_dict(data['item'])

    # Name/Type/Raid/Bosses un-editable
    updated_item.name = current_item.name
    updated_item.type = current_item.type
    updated_item.raid = current_item.raid
    updated_item.bosses = current_item.bosses

    dbinterface.update_item_information(current_item, updated_item)
    return '', 204


@app.route('/api/updateLootHistory', methods=['POST'])
def updateLootHistory():
    data = request.json
    try:
        row_id = data['row']['id']
    except KeyError:
        return 'Invalid Request Body', 400

    if 'user_id' not in session:
        return 'Not Allowed', 400
    else:
        current_user = dbinterface.load_user_by_id(session['user_id'])

    # TODO: Remove hardcoded permission levels
    if current_user.permission_level < 2:
        return 'Not Allowed', 400

    current_lh_line = dbinterface.load_loot_history_line_by_id(row_id)
    updated_lh_line = LootHistoryLine.from_dict(data['row'])

    dbinterface.update_loot_history_information(current_lh_line, updated_lh_line)
    return '', 204


@app.route('/api/addLootHistory', methods=['POST'])
def addLootHistory():
    data = request.json

    if 'row' not in data:
        return 'Invalid Request Body', 400

    if 'user_id' not in session:
        return 'Not Allowed', 400
    else:
        current_user = dbinterface.load_user_by_id(session['user_id'])

    # TODO: Remove hardcoded permission levels
    if current_user.permission_level < 2:
        return 'Not Allowed', 400

    new_lh_line = LootHistoryLine.from_dict(data['row'])

    dbinterface.add_loot_history(new_lh_line)
    return '', 204


@app.route('/api/deleteLootHistory', methods=['POST'])
def deleteLootHistory():
    data = request.json

    if 'id' not in data:
        return 'Invalid Request Body', 400

    if 'user_id' not in session:
        return 'Not Allowed', 400
    else:
        current_user = dbinterface.load_user_by_id(session['user_id'])

    # TODO: Remove hardcoded permission levels
    if current_user.permission_level < 2:
        return 'Not Allowed', 400

    dbinterface.delete_loot_history(data['id'])
    return '', 204


@app.route('/api/uploadAttendance', methods=['POST'])
def uploadAttendance():
    if 'user_id' not in session:
        return 'Not Allowed', 400
    else:
        current_user = dbinterface.load_user_by_id(session['user_id'])

    # TODO: Remove hardcoded permission levels
    if current_user.permission_level < 2:
        return 'Not Allowed', 400

    data = request.json

    if data['raid_day_id'] == 'New':
        raid_day_id = dbinterface.new_raid_day(str_to_date_ui(data['date']),
                                               data['raid_day_name'],
                                               data['raid_id'],
                                               ).id
    else:
        raid_day_id = data['raid_day_id']

    players, _ = dbinterface.load_players()

    player_names = unidecode(data['data']).split(',')

    for player_name in player_names:
        for player in players.values():
            if player.name.lower() == player_name.lower():
                if raid_day_id not in player.attendance:
                    # Update player
                    updated_player = Player.copy(player)
                    updated_player.attendance.append(raid_day_id)
                    dbinterface.update_player_information(player, updated_player)
                break
        else:  # Player not found - create new player
            player_name = player_name.lower().capitalize()
            # Dummy values for new player
            dbinterface.new_player(player_name, '', 0, '', 'Warrior', 'DPS', 'Member', attendance=[raid_day_id])

    return '', 204


@app.route('/api/uploadLootHistory', methods=['POST'])
def uploadLootHistory():
    if 'user_id' not in session:
        return 'Not Allowed', 400
    else:
        current_user = dbinterface.load_user_by_id(session['user_id'])

    # TODO: Remove hardcoded permission levels
    if current_user.permission_level < 2:
        return 'Not Allowed', 400

    data = request.json

    if data['raid_day_id'] == 'New':
        raid_day_id = dbinterface.new_raid_day(str_to_date_ui(data['date']),
                                               data['raid_day_name'],
                                               data['raid_id'],
                                               ).id
    else:
        raid_day_id = data['raid_day_id']

    players, _ = dbinterface.load_players()
    items = dbinterface.load_items()

    json_data = json.loads(data['data'])
    for loot_history_data in json_data:
        # Strip server name
        player_name = loot_history_data['player'].split('-')[0]
        item_id = loot_history_data['itemID']
        is_disenchant = loot_history_data['response'] == 'Disenchant'

        # Skip Player if doesn't already exist
        # Easy solution - attendance before loot
        # TODO: Don't skip player if doesn't already exist
        if not is_disenchant:
            for player in players.values():
                if player.name.lower() == player_name.lower():
                    player_id = player.id
                    new_lh_line = LootHistoryLine(0, raid_day_id, item_id, player_id)
                    dbinterface.add_loot_history(new_lh_line)

                    updated_player = Player.copy(player)
                    updated_player.remove_from_wishlist(item_id)
                    dbinterface.update_player_information(player, updated_player)

                    item = items[item_id]
                    updated_item = Item.copy(item)
                    updated_item.remove_from_individual_prio(player_id)
                    dbinterface.update_item_information(item, updated_item)
                    break

    return '', 204
