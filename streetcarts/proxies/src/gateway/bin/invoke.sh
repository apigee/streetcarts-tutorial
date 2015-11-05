#!/bin/bash

if [ -z $org ]; then
   source ./setenv.sh
fi
if [ -z $password ]; then
   source ./pw.sh
   source ./verify.sh
fi


echo -e "\n**** Getting PUBLIC app profile ****"

ks=`curl -u "$username:$password" "$url/v1/o/$org/developers/will@streetcarts.com/apps/sc-public-app" 2>/dev/null | egrep "consumer(Key|Secret)"`
pub_key=`echo $ks | awk -F '\"' '{ print $4 }'`

echo -e "\n    **** Got Consumer Key: $pub_key ****"




echo -e "\n**** Getting OWNER app profile ****"

ks=`curl -u "$username:$password" "$url/v1/o/$org/developers/will@streetcarts.com/apps/sc-owner-app" 2>/dev/null | egrep "consumer(Key|Secret)"`
key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`

echo -e "\n    **** Got Consumer Key: $key ****"
echo -e "\n    **** Got Consumer Secret: $secret ****"

auth=$(echo -ne "$key:$secret" | base64);

echo -e "\n    **** Base64 encoded credentials:  $auth ****"

echo  -e "\n**** Requesting access token. **** "

echo -e "curl -H \"Authorization: Basic $auth\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST \"https://$org-$env.$api_domain/$basepath/accesstoken\" -d \"grant_type=password&username=wwitman@apigee.com&password=apigee123\" \n"


accesstoken_response=`curl -s -k -H "Authorization: Basic $auth" -H "Content-Type: application/x-www-form-urlencoded" -X POST "https://$org-$env.$api_domain/$basepath/accesstoken" -d "grant_type=password&username=wwitman%40apigee.com&password=apigee123"`




echo -e  "**** AccessToken Response: \n $accesstoken_response"

token1=`echo $accesstoken_response | awk -F ':' '{ print $15 }'`
token2=`echo $token1 | awk -F "," '{print $1}'`
temp="${token2%\"}"
token2="${temp#\"}"
echo -e "\n**** Got Access Token: $token2"


token_response=`echo $accesstoken_response | awk -F ':' '{ print $10 }'`
#userid=`echo $token_response | cut -d'}' -f 2`
userid=`echo $token_response | awk -F "," '{print $1}'`

temp="${userid%\"}"
userid="${temp#\"}"

echo -e "\n**** Got Owner ID: $userid"







#echo -e  "    **** AccessToken Response: \n $accesstoken_response"

#tr=`echo $accesstoken_response | awk -F ':' '{ print $2 }'`
#token=`echo $tr | awk -F "," '{print $1}'`
#temp="${token%\"}"
#token="${temp#\"}"
#echo -e "\n    **** Got Access Token: $token"


#echo -e "\n\n**** Getting OWNER UUID"

#token_response=`echo $accesstoken_response | awk -F ':' '{ print $3 }'`
#userid=`echo $token_response | awk -F "," '{print $1}'`
#trim last character
#userid="${userid%?}"

#echo -e "\n    **** Got OWNER UUID: $userid"


echo -e "\n**** Create a new user"

echo -e "curl -s -k -H \"Authorization: Bearer $token\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST \"https://$org-$env.$api_domain/$basepath/users?apikey=$pub_key\" -d \"username=will200&password=abc123\""


user=`curl -s -k -H "Authorization: Bearer $token" -H "Content-Type: application/x-www-form-urlencoded" -X POST "https://$org-$env.$api_domain/$basepath/users?apikey=$pub_key" -d "username=will200&password=abc123"`

echo -e "\n    **** NEW USER DATA -- MANUALLY DELETE USER IN BAAS TO CLEAN UP"
echo -e "\n    $user"


echo -e "\n**** Get a User by UUID"

echo -e "curl -s -k -H \"Authorization: Bearer $token2\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST \"https://$org-$env.$api_domain/$basepath/users/$userid\" -d \"username=will200&password=abc123\""


user=`curl -s -k -H "Authorization: Bearer $token2" -H "Content-Type: application/x-www-form-urlencoded" -X GET "https://$org-$env.$api_domain/$basepath/users/$userid"`

echo -e "\n    **** NEW USER DATA -- MANUALLY DELETE USER IN BAAS TO CLEAN UP"
echo -e "\n    $user"



# Get a menu Item

# Put a menu Item

# Get updated menu Item




