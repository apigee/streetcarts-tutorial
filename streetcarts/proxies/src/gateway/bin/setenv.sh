#!/bin/bash
echo -e "\n**** Setting up environment variables. ****"

proxy="streetcarts"
export proxy=$proxy

basepath="v1/streetcarts"
export basepath=$basepath

username="your apigee email"

### If deploying to e2e docfood
#url="https://api.e2e.apigee.net"
#org="docfood"
#env="test"
#api_domain="e2e.apigee.net"


### If deploying to another place
url="https://api.enterprise.apigee.com"
org="your org name"
env="your environment name"
api_domain="apigee.net"

## Do not change the settings below
## --------------------------------------
export org=$org
export username=$username
export env=$env
export url=$url
export api_domain=$api_domain

echo "**** Organization: $org"
echo "**** Environment: $env"
echo "**** URL: $url"
echo "**** Proxy: $proxy"
echo -e "\n****"
