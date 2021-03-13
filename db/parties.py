import json


def main():
    parties = {}
    with open("mps.json", "r") as read_content: 
        for mp in json.load(read_content):
            if mp["party"] in parties:
                with parties[mp["party"]] as party:
                    party["TotalMps"] += 1
                    party["TotalScore"] += mp["score"]

                    for i in range(0,6):
                        parties[mp["party"]]["policies"][i] += mp["policies"][i]["score"]
                
            else:
                parties[mp["party"]] = {"TotalMps":1, "TotalScore":mp["score"], "policies" : mp["policies"]}
    json.dump(parties, open("parties.json", "w"))




