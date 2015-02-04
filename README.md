# Not much here right now...

### Just some debugging commands.

STATE_FILE=/tmp/presents.json node global_server.js
STATUS_FILE=/tmp/aaa_sts.txt INTEREST_FILE=/tmp/aaa_int.txt SERVER_HOST=127.0.0.1 SERVER_PORT=8081 TOKEN=AAA LOCAL_PORT=8082 node local_server.js
STATUS_FILE=/tmp/bbb_sts.txt INTEREST_FILE=/tmp/bbb_int.txt SERVER_HOST=127.0.0.1 SERVER_PORT=8081 TOKEN=BBB LOCAL_PORT=8083 node local_server.js
STATUS_FILE=/tmp/ccc_sts.txt INTEREST_FILE=/tmp/ccc_int.txt SERVER_HOST=127.0.0.1 SERVER_PORT=8081 TOKEN=CCC LOCAL_PORT=8084 node local_server.js

curl -X PUT http://localhost:8083/status/sleeping
curl -X PUT http://localhost:8083/interest/AAA