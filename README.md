# Not much here right now...

### Just some debugging commands.

STATE_FILE=/tmp/presents.json PORT=8080 npm run-script global_server
STATUS_FILE=/tmp/aaa_status.txt INTEREST_FILE=/tmp/aaa_interest.txt GLOBAL_HOST=localhost GLOBAL_PORT=8080 LOCAL_STATUS_PIN=-1 REMOTE_STATUS_PIN=-1 AWAKE_BUTTON_PIN=-1 TOKEN=AAA LOCAL_PORT=8081 npm run-script local_server
STATUS_FILE=/tmp/bbb_status.txt INTEREST_FILE=/tmp/bbb_interest.txt GLOBAL_HOST=localhost GLOBAL_PORT=8080 LOCAL_STATUS_PIN=-1 REMOTE_STATUS_PIN=-1 AWAKE_BUTTON_PIN=-1 TOKEN=BBB LOCAL_PORT=8082 npm run-script local_server
STATUS_FILE=/tmp/ccc_status.txt INTEREST_FILE=/tmp/ccc_interest.txt GLOBAL_HOST=localhost GLOBAL_PORT=8080 LOCAL_STATUS_PIN=-1 REMOTE_STATUS_PIN=-1 AWAKE_BUTTON_PIN=-1 TOKEN=CCC LOCAL_PORT=8083 npm run-script local_server


curl -X PUT http://localhost:8083/status/sleeping
curl -X PUT http://localhost:8083/interest/AAA