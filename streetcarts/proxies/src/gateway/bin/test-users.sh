#!/bin/bash

if [ -z $org ]; then
   source ./setenv.sh
fi
if [ -z $password ]; then
   source ./pw.sh
   source ./verify.sh
fi

price="5000"
menuid="4f93347a-6c57-11e5-9e1e-bba7b255b4ca"
itemid="bdb8630a-6c41-11e5-9cca-0754ad997d2c"
cartid="6766b55a-6b9d-11e5-9621-25cf35c25a04"


# Test file for the /menus proxy. 
# Use OAuth token for all of these calls (authenticated user app)
#
# 1. CREATE USER (API KEY)
# 2. GET USER BY ID (ACCESS TOKEN)



echo -e "\n**** Getting OWNER app profile ****"

ks=`curl -u "$username:$password" "$url/v1/o/$org/developers/will@streetcarts.com/apps/sc-owner-app" 2>/dev/null | egrep "consumer(Key|Secret)"`
owner_key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`

echo -e "\n    **** Got Consumer Key: $owner_key ****"
echo -e "\n    **** Got Consumer Secret: $secret ****"

auth=$(echo -ne "$owner_key:$secret" | base64);

echo -e "\n    **** Base64 encoded credentials:  $auth ****"




echo  -e "\n**** Requesting access token. **** "

echo -e "curl -H \"Authorization: Basic $auth\" -H \"x-api-key: $owner_key\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST \"https://$org-$env.$api_domain/$basepath/accesstoken\" -d \"grant_type=password&username=wwitman@apigee.com&password=apigee123\" \n"


accesstoken_response=`curl -s -k -H "Authorization: Basic $auth" -H "Content-Type: application/x-www-form-urlencoded" -H "x-api-key: $owner_key" -X POST "https://$org-$env.$api_domain/$basepath/accesstoken" -d "grant_type=password&username=wwitman%40apigee.com&password=apigee123"`



#echo -e  "**** AccessToken Response: \n $accesstoken_response"

token1=`echo $accesstoken_response | awk -F ':' '{ print $15 }'`
#tr=`echo $accesstoken_response | awk -F ':' '{ print $2 }'`
token2=`echo $token1 | awk -F "," '{print $1}'`
temp="${token2%\"}"
token2="${temp#\"}"
echo -e "\n**** Got Access Token: $token2"



token_response=`echo $accesstoken_response | awk -F ':' '{ print $10 }'`
#token_response=`echo $accesstoken_response | awk -F ':' '{ print $3 }'`
#userid=`echo $token_response | cut -d'}' -f 2`
userid=`echo $token_response | awk -F "," '{print $1}'`

temp="${userid%\"}"
userid="${temp#\"}"

echo -e "\n**** Got Owner ID: $userid"






echo -e "\n######## 1. CREATE NEW USER"


user=`curl -s -k "Content-Type: application/json" -X POST "https://$org-$env.$api_domain/$basepath/users?apikey=$owner_key" -d "email=will@abc5.com&username=will402&password=abc123"`

echo -e "\n    **** NEW USER DATA -- MANUALLY DELETE USER IN BAAS TO CLEAN UP"
echo -e "\n    $user"


echo -e "\n######## 2. GET A USER BY ID"

user=`curl -s -k -H "Authorization: Bearer $token2" -H "Content-Type: application/x-www-form-urlencoded" -X GET "https://$org-$env.$api_domain/$basepath/users/$userid"`

echo -e "\n    **** User Data: "
echo -e "\n    $user"










