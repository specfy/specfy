#!/usr/bin/env bash

jq 'walk(if type == "object" then with_entries(select(.key | test("^jest|stylelint|turbowatch|prettier|eslint|semantic|dotenv|nodemon|renovate") | not)) else . end) | { name, type, dependencies, devDependencies, packageManager, workspaces }' <"$1" >"${1}_tmp"
mv "${1}_tmp" "$1"
