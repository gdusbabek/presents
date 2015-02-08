#!/bin/bash

: ${STATUS_FILE?"Need to set STATUS_FILE"}
: ${INTEREST_FILE?"Need to set INTEREST_FILE"}
: ${GLOBAL_HOST?"Need to set GLOBAL_HOST"}
: ${GLOBAL_PORT?"Need to set GLOBAL_PORT"}
: ${LOCAL_STATUS_PIN?"Need to set LOCAL_STATUS_PIN"}
: ${REMOTE_STATUS_PIN?"Need to set REMOTE_STATUS_PIN"}
: ${AWAKE_BUTTON_PIN?"Need to set AWAKE_BUTTON_PIN"}
: ${TOKEN?"Need to set TOKEN"}
: ${LOCAL_PORT?"Need to set LOCAL_PORT"}

node ./server/lib/local_server.js