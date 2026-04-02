#!/bin/sh

if [ -n "$STARTUP_DELAY" ]; then
    DELAY=$STARTUP_DELAY
else
    RANDOM_BYTES=$(od -An -tu4 -N4 /dev/urandom | tr -d ' ')
    DELAY=$(( (RANDOM_BYTES % 15) + 1 ))
fi

echo "Node ${NODE_ID} will start after ${DELAY} seconds..."
sleep "${DELAY}"

echo "Starting PaxosNode..."
exec dotnet PaxosNode.dll
