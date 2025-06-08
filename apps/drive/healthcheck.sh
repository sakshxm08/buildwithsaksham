#!/bin/sh
PORT=${FB_PORT:-$(jq -r .port /.devault.json)}
ADDRESS=${FB_ADDRESS:-$(jq -r .address /.devault.json)}
ADDRESS=${ADDRESS:-localhost}
curl -f http://$ADDRESS:$PORT/health || exit 1
