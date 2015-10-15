#!/bin/bash

if [ -z $org ]; then
   source ./setenv.sh
fi
if [ -z $password ]; then
   source ./pw.sh
   source ./verify.sh
fi

echo -e "\n**** Deploying $proxy to $env on $url using $username and $org ****"
apigeetool deployproxy --baseuri https://api.e2e.apigee.net -u $username -p $password -o $org -e $env -n $proxy -d .. -U

echo -e "\n****  If 'State: deployed', then your API Proxy is ready to be invoked."
echo -e "\n**** Run 'invoke.sh'"
