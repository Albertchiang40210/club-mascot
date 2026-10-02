#!/bin/bash
cd "$(dirname "$0")/game" || exit 1
[ -d node_modules ] || npm install
npm run dev -- --open
