from flask import Flask, jsonify

import dbinterface

app = Flask(__name__)


@app.route('/getPlayers', methods=['GET'])
def getPlayers():
    players = dbinterface.load_players()
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
