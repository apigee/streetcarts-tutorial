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

echo -e "curl -H \"Authorization: Basic $auth\" -H \"x-api-key: $key\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST \"https://$org-$env.$api_domain/$basepath/accesstoken\" -d \"grant_type=password&username=wwitman@apigee.com&password=apigee123\" \n"


accesstoken_response=`curl -s -k -H "Authorization: Basic $auth" -H "Content-Type: application/x-www-form-urlencoded" -H "x-api-key: $key" -X POST "https://$org-$env.$api_domain/$basepath/accesstoken" -d "grant_type=password&username=wwitman%40apigee.com&password=apigee123"`


#read -p "Press any key to continue... " -n1 -s

echo -e  "**** AccessToken Response: \n $accesstoken_response"

token1=`echo $accesstoken_response | awk -F ':' '{ print $15 }'`
#tr=`echo $accesstoken_response | awk -F ':' '{ print $2 }'`
token2=`echo $token1 | awk -F "," '{print $1}'`
temp="${token2%\"}"
token2="${temp#\"}"
echo -e "\n**** Got Access Token: $token2"


#read -p "Press any key to continue... " -n1 -s

token_response=`echo $accesstoken_response | awk -F ':' '{ print $10 }'`
#token_response=`echo $accesstoken_response | awk -F ':' '{ print $3 }'`
#userid=`echo $token_response | cut -d'}' -f 2`
userid=`echo $token_response | awk -F "," '{print $1}'`

temp="${userid%\"}"
userid="${temp#\"}"

echo -e "\n**** Got Owner ID: $userid"




#read -p "Press any key to continue... " -n1 -s


echo -e "\n**** Create a new user"

echo -e "curl -s -k -H \"Authorization: Bearer $token\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST \"https://$org-$env.$api_domain/$basepath/users?apikey=$pub_key\" -d \"username=will200&password=abc123\""


user=`curl -s -k "Content-Type: application/x-www-form-urlencoded" -X POST "https://$org-$env.$api_domain/$basepath/users?apikey=$pub_key" -d "username=will200&password=abc123"`

echo -e "\n    **** NEW USER DATA -- MANUALLY DELETE USER IN BAAS TO CLEAN UP"
echo -e "\n    $user"


echo -e "\n**** Get a User by UUID"

echo -e "curl -s -k -H \"Authorization: Bearer $token2\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST \"https://$org-$env.$api_domain/$basepath/users/$userid\" -d \"username=will200&password=abc123\""


user=`curl -s -k -H "Authorization: Bearer $token2" -H "Content-Type: application/x-www-form-urlencoded" -X GET "https://$org-$env.$api_domain/$basepath/users/$userid"`

echo -e "\n    **** User Data: "
echo -e "\n    $user"




# GET ALL FOOD CARTS

echo -e "\n**** GET ALL FOOD CARTS"

echo -e "curl -s -k \"Content-Type: application/x-www-form-urlencoded\" -X GET \"https://$org-$env.$api_domain/$basepath/foodcarts?apikey=$pub_key\""


carts=`curl -s -k "Content-Type: application/x-www-form-urlencoded" -X GET "https://$org-$env.$api_domain/$basepath/foodcarts?apikey=$pub_key"`

echo -e "\n    **** FOOD CARTS: "
echo -e "\n    $carts"


# GET CART BY ID

echo -e "\n**** GET CART BY ID"

echo -e "curl -s -k -H \"Authorization: Bearer $token2\"\"Content-Type: application/x-www-form-urlencoded\" -X GET \"https://$org-$env.$api_domain/$basepath/foodcarts/$cartid?apikey=$pub_key\""

cartid="6766b55a-6b9d-11e5-9621-25cf35c25a04"
cart=`curl -s -k -H "Authorization: Bearer $token2" "Content-Type: application/x-www-form-urlencoded" -X GET "https://$org-$env.$api_domain/$basepath/foodcarts/$cartid"`

echo -e "\n    **** FOOD CART: "
echo -e "\n    $cart"



# GET MENUS FOR CART

echo -e "\n**** GET MENUS FOR CART"

echo -e "curl -s -k \"Content-Type: application/x-www-form-urlencoded\" -X GET \"https://$org-$env.$api_domain/$basepath/foodcarts/$cartid/menus?apikey=$pub_key\""

cartid="6766b55a-6b9d-11e5-9621-25cf35c25a04"
menu=`curl -s -k -H "Content-Type: application/x-www-form-urlencoded" -X GET "https://$org-$env.$api_domain/$basepath/foodcarts/$cartid/menus?apikey=$pub_key"`

echo -e "\n    **** MENUS: "
echo -e "\n    $menu"


menuid="4f93347a-6c57-11e5-9e1e-bba7b255b4ca"

# GET ITEMS FOR MENU

echo -e "\n**** GET ITEMS IN MENU"

echo -e "curl -s -k \"Content-Type: application/x-www-form-urlencoded\" -X GET \"https://$org-$env.$api_domain/$basepath/menus/$menuid/items?apikey=$pub_key\""

items=`curl -s -k -H "Content-Type: application/x-www-form-urlencoded" -X GET "https://$org-$env.$api_domain/$basepath/menus/$menuid/items?apikey=$pub_key"`

echo -e "\n    **** THE ITEMS: "
echo -e "\n    $items"


#Get a menu item by id

itemid="bdb8630a-6c41-11e5-9cca-0754ad997d2c"

echo -e "\n**** GET MENU ITEM BY ID"

echo -e "curl -s -k -H \"Authorization: Bearer $token2\"  \"Content-Type: application/x-www-form-urlencoded\" -X GET \"http://$org-$env.$api_domain/$basepath/menus/$menuid/items/$itemid\""

item=`curl -s -k -H "Authorization: Bearer $token2"  -H "Content-Type: application/x-www-form-urlencoded" -X GET "http://$org-$env.$api_domain/$basepath/menus/$menuid/items/$itemid"`

echo -e "\n    **** MENU ITEM: "
echo -e "\n    $item"



#Update a menu item

itemid="bdb8630a-6c41-11e5-9cca-0754ad997d2c"

echo -e "\n**** UPDATE MENU ITEM"

echo -e "curl -s -k -H \"Authorization: Bearer $token2\"  \"Content-Type: application/x-www-form-urlencoded\" -X PUT \"http://$org-$env.$api_domain/$basepath/menus/$menuid/items/$itemid\" -d \"price=100\""

cartid="6766b55a-6b9d-11e5-9621-25cf35c25a04"
new_item=`curl -s -k -H "Authorization: Bearer $token2"  -H "Content-Type: application/x-www-form-urlencoded" -X PUT "http://$org-$env.$api_domain/$basepath/menus/$menuid/items/$itemid" -d "price=100"`

echo -e "\n    **** UPDATED ITEM: "
echo -e "\n    $new_item"



# Get a menu Item

# Put a menu Item

# Get updated menu Item




