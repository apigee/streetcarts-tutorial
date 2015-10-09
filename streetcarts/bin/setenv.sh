#!/bin/bash
echo -e "\n**** Setting up environment variables. ****"

proxy="streetcarts"
export proxy=$proxy

org="docs"
username="wwitman@apigee.com"
url="https://api.enterprise.apigee.com"
env="test"
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
