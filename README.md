# Data-Store

To run the code:
1) npm install
2) node app.js

Important points:
1) Project runs on port 8000
2) If user doesn't specify "expiresIn" for each data getting stored, then Default expiry time is: 300seconds
3) If user deosn't specify "path" for each request, then Default path taken by system is "Data-Store/dataStore.json"
4) expiresIn field takes input in seconds
5) path field input string should follow this format: "I:\\project\\DataStore.json"
----------------------------------
Below are the sample API endpoints

1) To save data in Data-Store
POST: /dataStore/saveData
BODY: 
{"data":{"1": {"name": "Uday", "id": 3, "expiresIn": 100}}, 
"path": "I:\\project\\DataStore.json"}

optional fields: data.expiresIn, path
mandatory field: data
--------------------------------------
2) To retrieve data based on key from Data-Store
GET: /dataStore?path=I:\\project\\DataStore.json&id=1

optional field:path
mandatory field: id
----------------------------------------
3)To delete data based on key from Data-Store
DELETE: /dataStore?path=I:\\project\\DataStore.json&id=1

optional field:path
mandatory field: id
-----------------------------------------
