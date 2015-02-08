#!/bin/bash

: ${STATE_FILE?"Need to set STATE_FILE"}
: ${PORT?"Need to set PORT"}

node ./server/lib/global_server.js