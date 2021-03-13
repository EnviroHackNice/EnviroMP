import requests
import json
import sys
from urllib.parse import unquote
from bs4 import BeautifulSoup

policy_to_id = {
	"Stop climate change" : 1030,
	"In favour of HS2" : 6753,
	"In favour of further regulation of shale gas extraction (fracking)" : 6741,
	"In favour of increasing air passenger duty tax" : 6699,
	"Against on shore wind turbines" : 6756,
	"In favour of further incentives for low carbon energy generation" : 6704}

policies = {
	1030: {
		"id": 1030,
		"pro_env": True,
		"name": "Stop climate change"
	},
	6753: {
		"id": 6753,
		"pro_env": True,
		"name": "In favour of HS2"
	},
	6741: {
		"id": 6741,
		"pro_env": True,
		"name": "In favour of further regulation of shale gas extraction (fracking)"
	},
	6699: {
		"id": 6699,
		"pro_env": True,
		"name": "In favour of increasing air passenger duty tax"
	},
	6756: {
		"id": 6756,
		"pro_env": False,
		"name": "Against on shore wind turbines"
	},
	6704: {
		"id": 6704,
		"pro_env": True,
		"name": "In favour of further incentives for low carbon energy generation"
	}
}

def initMps():
	URL = "https://www.publicwhip.org.uk/mps.php"
	r = requests.get(URL).text
	soup = BeautifulSoup(r, features="html.parser")
	results = soup.find_all('tr', {"class" : ""})
	mps_list = []
	for result in results:
		record = result.find_all('td')[0]
		mp_url = record.find_all('a', href=True)[0]['href']
		mp_name = record.a.string[1:]
		info_parts = mp_url.split("=")
		mpn = info_parts[1].split("&")[0]
		mpc = info_parts[2].split("&")[0]
		constituency = mpc.split("_")
		constituency = " ".join(constituency)
		new_mp = MP(mp_name, constituency, mpn, mpc)
		mps_list.append(new_mp)

	return mps_list

def rankMps(mps_list):
	mps_list.sort(key=lambda mp: mp.total_score, reverse=True)
	count = len(mps_list)
	ranks = ("S", "A", "B", "C", "D", "E", "F")
	for i in range(count):
		rank = ranks[int(i/(count/7))]
		mps_list[i].setRank(rank)

def exportMps(mps_list):
	exported = [mp.toObj() for mp in mps_list]
	return json.dumps(exported)

class MP():
	def __init__(self, name, constituency, mpn, mpc):
		self.name = name
		self.constituency = unquote(constituency)
		self.mpn = mpn
		self.mpc = mpc
		
		self.party = ""
		self.img = ""
		self.email = ""

		self.rank = ""
		self.total_score = 0.0
		self.policy_scores = {}

	def fetchPolicyScore(self, policyId):
		URL = "https://www.publicwhip.org.uk/mp.php?mpn=" + self.mpn + "&mpc=" + self.mpc + "&house=commons&dmp=" + str(policyId)
		r = requests.get(URL).text
		soup = BeautifulSoup(r, features="html.parser")
		results = soup.find_all("em", {"class": "percent"})
		score = float(results[0].text[:-1])
		if not policies[policyId]["pro_env"]:
			score = 100 - score
		self.policy_scores[policyId] = score
		return score

	def fetchAllPolicyScores(self):
		for pid in policies.keys():
			self.fetchPolicyScore(pid)
		scores = [self.policy_scores[id] for id in self.policy_scores.keys()]
		self.total_score = sum(scores)/len(scores)

	def setRank(self, rank):
		self.rank = rank
	
	def fetchMpData(self):
		endpoint = "https://members-api.parliament.uk/api"
		constituency = self.constituency
		name = self.name

		while True:
			tries = 0
			response = requests.get(f"{endpoint}/Location/Constituency/Search?searchText={constituency}", timeout=10)
			if response.status_code >= 400:
				if tries >= 3:
					print("Failed retrying", file=sys.stderr)
					return
				print(response.err, file=sys.stderr)
				print("retrying", file=sys.stderr)
				tries += 1
			else:
				break

		response = response.json()
		if len(response["items"]) == 0:
			print(f"No response found for const.: {constituency}", file=sys.stderr)
			return

		mp = response["items"][0]["value"]["currentRepresentation"]["member"]

		self.party = mp["value"]["latestParty"]["name"]
		self.img = mp["value"]["thumbnailUrl"]

		emailUrl = mp["links"][3]["href"]
		while True:
			tries = 0
			response = requests.get(f"{endpoint}{emailUrl}", timeout=10)
			if response.status_code >= 400:
				if tries >= 3:
					print("Failed retrying", file=sys.stderr)
					return
				print(response.err, file=sys.stderr)
				print("retrying", file=sys.stderr)
				tries += 1
			else:
				break
			return

		response = response.json()
		if "email" in response["value"][0].keys():
			email = response["value"][0]["email"]
			self.email = email
		else:
			print("No email found for {name}", file=sys.stderr)

	def setImg(self, img):
		self.img = img

	def toObj(self):
		mp_obj = {
			"mpn": self.mpn,
			"mpc": self.mpc,
			"name": self.name,
			"constituency": self.constituency,
			"party": self.party,
			"image": self.img,
			"email": self.email,
			"total_score": self.total_score,
			"rank": self.rank,
			"policies": [
				{
					"name": policies[id]["name"],
					"score": self.policy_scores[id],
					"url": "https://www.publicwhip.org.uk/mp.php?mpn=" + self.mpn + "&mpc=" + self.mpc + "&house=commons&dmp=" + str(id)
				} for id in self.policy_scores.keys()
			]
		}
		return mp_obj

	def __repr__(self):
		return self.name + " - " + str(self.constituency)

def get_mps(mps, policy_id):
	valid_mps = [mp for mp in mps if policy_id in mp.policy_scores.keys()]
	valid_mps.sort(key = lambda x : x.policy_scores[id], reverse=True)
	return valid_mps

def save(mps, fn):
	with open(fn, "w") as file:
		file.write(mps)

def main():
	mps_list = initMps()
	save(exportMps(mps_list), "db/temp/mps_init.json")

	k = 0
	for i in range(len(mps_list)):
		print(f"{i}/650")
		mps_list[i].fetchMpData()
		print("Data fetched")
		mps_list[i].fetchAllPolicyScores()
		print("Policy scores fetched")
		if i % 5 == 0:
			save(exportMps(mps_list), f"db/temp/mps_temp_{k}.json")
			k += 1

	rankMps(mps_list)
	save(exportMps(mps_list), "db/mps.json")

def cont():
	mps_list = initMps()

	cached = []
	with open("db/temp/mps_temp_258.json", "r") as f:
		cached = json.load(f)
	
	k=0
	for i in range(len(mps_list)):
		if len(cached[i]["policies"]) == 0:
			print(f"{i}/650")
			mps_list[i].fetchMpData()
			print("Data fetched")
			# mps_list[i].fetchAllPolicyScores()
			print("Policy scores fetched")
		else:
			mps_list[i].party = cached[i]["party"]
			mps_list[i].img = cached[i]["image"]
			mps_list[i].email = cached[i]["email"]
			
			scores = [p["score"] for p in cached[i]["policies"]]
			mps_list[i].total_score = sum(scores)/len(scores)
			for p in cached[i]["policies"]:
				pid = policy_to_id[p["name"]]
				mps_list[i].policy_scores[pid] = p["score"]

		if i % 5 == 0:
			save(exportMps(mps_list), f"db/temp/mps_temp_{k}.json")
			k += 1

	rankMps(mps_list)
	for mp in mps_list:
		print(mp.name, "-", mp.total_score)
	text = exportMps(mps_list)
	save(text, "db/mps_cache.json")

if __name__ == "__main__":
	cont()
	