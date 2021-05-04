#!/bin/sh
echo "window._env_ = {" > ./env-config1.js
awk -F '=' '{ print $1 ": \"" (ENVIRON[$1] ? ENVIRON[$1] : $2) "\"," }' ./.env >> ./env-config1.js
echo "}" >> ./env-config1.js
echo "" >> ./env-config1.js
awk '{ sub("\r$", ""); print }' ./env-config1.js > env-config.js