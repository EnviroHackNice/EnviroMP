import flask
import requests
import datetime
import json
from db.scraper import main as mp_fetch
from db.parties import main as party_fetch

API_KEY = "C6FuYkASnMvvCM4hJaBoukGK"
#https://www.theyworkforyou.com/api/function?key= + API_KEY + &output=js&other_variables

app = flask.Flask(__name__)

mp_data = json.loads(open("mps_cache.json", "r"))
party_data = json.loads(open("parties.json", "r"))

def refetch_mp_data():
    mp_fetch()
    party_fetch()
    mp_data = json.loads(open("mps_cache.json", "r"))
    party_data = json.loads(open("parties.json", "r"))
    return (mp_data, party_data)

@app.context_processor
def inject_site_data():
    return {
        "site": {
            "title": "EnviroMP",
            "tagline": "Score MPs’ environmental-friendliness",
            # "url": "",
            "version": "0.1.0",
            # "google_analytics_id": "",
            "year": datetime.now().year,
        }
    }

@app.route("/mp-search")
def mp_search():
    return flask.render_template(r"pages/mp-search.html", title="MP Search")

@app.route("/mp-compare")
def mp_compare():
    return flask.render_template(r"pages/mp-compare.html", title="MP Compare")

@app.route('/res/<path:path>')
def send_res(path):
    return send_from_directory('res', path)

# todo
@app.route("/api/get_mp/<mpn:str>", methods=["GET"])
def api_get_mp(mpn):
    for mp in mp_data:
        if mp["mpn"] == mpn:
            return json.dumps(mp)

@app.route("/api/get_parties", methods=["GET"])
def api_get_parties():
	serialized = json.dumps(party_data)
	return serialized

# todo
@app.route("/api/get_mps", methods=["GET"])
def api_get_mps():
    serialized = json.dumps(mp_data)
    return serialized