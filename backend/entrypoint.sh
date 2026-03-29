#!/bin/sh

echo "Node will start after ${STARTUP_DELAY:-0} seconds..."
sleep "${STARTUP_DELAY:-0}"

echo "Starting PaxosNode..."
exec dotnet PaxosNode.dll