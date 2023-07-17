#!/usr/bin/env bash

list=($1)
regex='^jest|stylelint|turbowatch|prettier|eslint|semantic|dotenv|nodemon|renovate'

for file in "${list[@]}"; do
  echo "cleaning $file"
  jq "walk(if type == \"object\" then with_entries(select(.key | test(\"$regex\") | not)) else . end) | { name, type, dependencies, devDependencies, packageManager, workspaces }" <"$file" >"${file}_tmp"
  # jq empties the file if I write directly, not sure why
  mv "${file}_tmp" "${file}"
done
