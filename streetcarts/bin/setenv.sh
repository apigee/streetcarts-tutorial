#!/bin/bash
echo -e "\n**** Setting up environment variables. ****"

proxy="streetcarts"
export proxy=$proxy

org="docfood"
username="wwitman@apigee.com"
url="https://api.e2e.apigee.net"
env="test"
api_domain="e2e.apigee.net"

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
