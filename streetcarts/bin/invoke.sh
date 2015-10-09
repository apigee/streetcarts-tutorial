#!/bin/bash

if [ -z $org ]; then
   source ./setenv.sh
fi
if [ -z $password ]; then
   source ./pw.sh
   source ./verify.sh
fi

echo -e "\n **** Getting OWNER app profile ****"

ks=`curl -u "$username:$password" "$url/v1/o/$org/developers/$proxy@sample.com/apps/$proxy-owner-app" 2>/dev/null | egrep "consumer(Key|Secret)"`
key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`

echo -e "\n**** Got Consumer Key: $key ****"
echo -e "\n**** Got Consumer Secret: $secret ****"

auth=$(echo -ne "$key:$secret" | base64);
echo -e "\n**** Base64 encoded credentials:  $auth ****"

echo  -e "\n**** Requesting access token. **** "

accesstoken_response=`curl -s -H "Authorization: Basic $auth" -H "Content-Type: application/x-www-form-urlencoded" -X POST "https://docs-test.apigee.net/$proxy/accesstoken" -d "grant_type=password&username=wwitman%40apigee.com&password=apigee123"`


echo -e "curl -H \"Authorization: Basic $auth\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST \"https://docs-test.apigee.net/$proxy/accesstoken\" -d \"grant_type=password&username=wwitman@apigee.com&password=apigee123\" \n"


echo -e  "**** AccessToken Response: \n $accesstoken_response"

token1=`echo $accesstoken_response | awk -F ':' '{ print $2 }'`
token2=`echo $token1 | awk -F "," '{print $1}'`
echo -e "\n**** Got Access Token: $token2"



userid1=`echo $accesstoken_response | awk -F ':' '{ print $3 }'`
userid2=`echo $userid1 | cut -d'}' -f 1`
echo -e "\n**** Got Owner ID 2: $userid2"


echo -e "\n**** Call /users/{id}/carts"

carts=`curl -s -H "Authorization: Bearer $token2" -H "Content-Type: application/x-www-form-urlencoded" -X GET "https://docs-test.apigee.net/$proxy/users/$userid2/carts"`

echo -e "\n**** FOOD  CART DATA
echo -e "\n $carts
