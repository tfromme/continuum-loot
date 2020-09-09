#!/bin/bash
# This will only work from my machine since I have the proper ssh keys
ssh root@tfrom.me 'rm -rf /etc/continuum-loot/build'
scp -r build root@tfrom.me:/etc/continuum-loot
pushd api
scp *.py requirements.txt root@tfrom.me:/etc/continuum-loot/api
popd
ssh root@tfrom.me 'systemctl restart continuum-loot-api'
