import pickle
import json
with open('list_formatted_cases.pkl', 'rb') as fp:
    json_data = pickle.load(fp)
    print(len(json_data))
    # with open('loaded_json.json', 'a') as out:
    #     json.dump(json_data, out)