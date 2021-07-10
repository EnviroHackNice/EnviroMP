import flask
import requests
import datetime
import json
import os
from db.scraper import main as mp_fetch
from db.parties import main as party_fetch

API_KEY = "C6FuYkASnMvvCM4hJaBoukGK"
#https://www.theyworkforyou.com/api/function?key= + API_KEY + &output=js&other_variables

app = flask.Flask(__name__)

with open(os.path.join("db", "mps_cache.json"), "r") as f:
	mp_data = json.load(f)
print("loaded mp_data")

# with open("parties.json", "r") as f:
# 	party_data = json.load(f)

def refetch_mp_data():
	mp_fetch()
	party_fetch()
	mp_data = json.load(open("mps_cache.json", "r"))
	party_data = json.load(open("parties.json", "r"))
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
			"year": datetime.datetime.now().year,
		}
	}

@app.route("/about")
def about():
	return flask.render_template(r"pages/about.html", title="About")

@app.route("/mp-search")
def mp_search():
	return flask.render_template(r"pages/mp-search.html", title="MP Search")

# @app.route("/mp-compare")
# def mp_compare():
# 	return flask.render_template(r"pages/mp-compare.html", title="MP Compare")

def get_policies():
	policies = []
	for mp in mp_data:
		for policy_data in mp["policies"]:
			policy_name = policy_data["name"]

			if policy_name not in policies:
				policies.append(policy_name)
	return policies

@app.route("/by-policy")
def by_policy():
	return flask.render_template(r"pages/by-policy.html", title="By Policy", policies=get_policies())

@app.route("/by-policy/<target_policy>")
def by_policy_page(target_policy):
	data = {}
	for mp in mp_data:
		for policy_data in mp["policies"]:
			policy_name = policy_data["name"]
			# if policy_name not in data:
			# 	data[policy_name] = {}
			if policy_name.lower().replace(" ", "_") == target_policy:
				value = {}
				value.update(policy_data)
				value.update(mp)
				del value["policies"]
				data[mp["name"]] = value
	return flask.render_template(r"pages/by-policy.html", title="By Policy", policies=get_policies(), db_data=json.dumps(data))

@app.route("/email", methods = ["GET"])
def email():
	return flask.render_template(r"pages/email.html", title="Email")
	
@app.route('/res/<path:path>')
def send_res(path):
	return flask.send_from_directory('res', path)

@app.route("/api/get_mp/<mpn>", methods=["GET"])
def api_get_mp(mpn):
	for mp in mp_data:
		if mp["mpn"] == mpn:
			return json.dumps(mp)
	return json.dumps({})

@app.route("/api/get_mps", methods=["GET"])
def api_get_mps():
	ret = {}
	for mp in mp_data:
		try:
			ret[mp["mpn"]] = mp["name"]
		except:
			pass
	return json.dumps(ret)

# @app.route("/api/get_policies", methods=["GET"])
# def api_get_policies():
# 	ret = {}
# 	for mp in mp_data:
# 		try:
# 			ret[mp["mpn"]] = mp["name"]
# 		except:
# 			pass
# 	return json.dumps(ret)

# todo
@app.route("/api/get_parties", methods=["GET"])
def api_get_parties():
	serialized = json.dumps(party_data)
	return serialized

@app.route("/")
def index():
	return flask.redirect("/mp-search")

if __name__ == '__main__':
	app.run()