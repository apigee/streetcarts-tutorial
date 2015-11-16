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
# 1. GET MENUS FOR CART (API KEY)
# 2. GET ITEMS IN MENU (API KEY)
# 3. GET A MENU ITEM BY ID (ACCESS TOKEN)
# 4. UPDATE A MENU ITEM (ACCESS TOKEN)
# 5. CREATE NEW MENU (ACCESS TOKEN)
# 6. ADD ITEM TO A MENU (ACCESS TOKEN)


echo -e "\n**** GET THE OWNER APP PROFILE ****"

ks=`curl -u "$username:$password" "$url/v1/o/$org/developers/will@streetcarts.com/apps/sc-owner-app" 2>/dev/null | egrep "consumer(Key|Secret)"`
owner_key=`echo $ks | awk -F '\"' '{ print $4 }'`
owner_secret=`echo $ks | awk -F '\"' '{ print $8 }'`

echo -e "\n    **** Got Consumer Key: $owner_key ****"
echo -e "\n    **** Got Consumer Secret: $owner_secret ****"

auth=$(echo -ne "$owner_key:$owner_secret" | base64);

echo -e "\n    **** Base64 encoded credentials:  $auth ****"




echo  -e "\n**** Requesting access token. **** "

echo -e "curl -H \"Authorization: Basic $auth\" -H \"x-api-key: $owner_key\" -H \"Content-Type: application/x-www-form-urlencoded\" -X POST \"https://$org-$env.$api_domain/$basepath/accesstoken\" -d \"grant_type=password&username=wwitman@apigee.com&password=apigee123\" \n"

accesstoken_response=`curl -s -k -H "Authorization: Basic $auth" -H "Content-Type: application/x-www-form-urlencoded" -H "x-api-key: $owner_key" -X POST "https://$org-$env.$api_domain/$basepath/accesstoken" -d "grant_type=password&username=wwitman%40apigee.com&password=apigee123"`

echo -e  "**** AccessToken Response: \n $accesstoken_response"

token1=`echo $accesstoken_response | awk -F ':' '{ print $15 }'`
#tr=`echo $accesstoken_response | awk -F ':' '{ print $2 }'`
owner_token=`echo $token1 | awk -F "," '{print $1}'`
temp="${owner_token%\"}"
owner_token="${temp#\"}"
echo -e "\n**** Got Access Token: $owner_token"


token_response=`echo $accesstoken_response | awk -F ':' '{ print $10 }'`
#token_response=`echo $accesstoken_response | awk -F ':' '{ print $3 }'`
#userid=`echo $token_response | cut -d'}' -f 2`
userid=`echo $token_response | awk -F "," '{print $1}'`

temp="${userid%\"}"
userid="${temp#\"}"

echo -e "\n**** Got Owner ID: $userid"


# 1. GET CART MENUS (API KEY)

echo -e "\n######## 1. GET MENUS FOR CART (API KEY)"
echo -e "\n**** /foodcarts/$cartid/menus?apikey=$owner_key"


#echo -e "curl -s -k \"Content-Type: application/x-www-form-urlencoded\" -X GET \"https://$org-$env.$api_domain/$basepath/foodcarts/$cartid/menus?apikey=$owner_key\""

menus=`curl -s -k -H "Content-Type: application/x-www-form-urlencoded" -X GET "https://$org-$env.$api_domain/$basepath/foodcarts/$cartid/menus?apikey=$owner_key"`

echo -e "\n    **** MENUS: "
echo -e "\n    $menus"
# test change



# 2. GET MENU (API KEY)

echo -e "\n######## 2. GET MENU"

echo -e "curl -s -k \"Content-Type: application/x-www-form-urlencoded\" -X GET \"https://$org-$env.$api_domain/$basepath/menus/$menuid?apikey=$owner_key\""

menu=`curl -s -k -H "Content-Type: application/x-www-form-urlencoded" -X GET "https://$org-$env.$api_domain/$basepath/menus/$menuid?apikey=$owner_key"`

echo -e "\n    **** THE MENU: "
echo -e "\n    $menu"


# 3. GET MENU ITEMS (API KEY)



echo -e "\n######## 3. GET MENU ITEMS (API KEY)"
echo -e "curl -s -k -H \"Content-Type: application/x-www-form-urlencoded\" -X GET \"http://$org-$env.$api_domain/$basepath/menus/$menuid/items?apikey=$owner_key\""

items=`curl -s -k -H "Content-Type: application/x-www-form-urlencoded" -X GET "http://$org-$env.$api_domain/$basepath/menus/$menuid/items?apikey=$owner_key"`

echo -e "\n    **** MENU ITEMS: "
echo -e "\n    $items"



# 4. UPDATE A MENU ITEM (ACCESS TOKEN)



echo -e "\n######## 4. UPDATE MENU ITEM"


new_item=`curl -s -k -H "Authorization: Bearer $owner_token"  -H "Content-Type: application/json" -X PUT "http://$org-$env.$api_domain/$basepath/menus/$menuid/items/$itemid" -d "@testdata/item.json"`

echo -e "\n    **** UPDATED ITEM: "
echo -e "\n    $new_item"


# 5. CREATE NEW MENU FOR A CART (ACCESS TOKEN)

echo -e "\n######## 5. CREATE NEW MENU FOR A CART (ACCESS TOKEN)"


new_menu=`curl -s -k -H "Authorization: Bearer $owner_token"  -H "Content-Type: application/x-www-form-urlencoded" -X POST "http://$org-$env.$api_domain/$basepath/foodcarts/$cartid/menus" -d "menuName=Downtown Famous Texas Hot Weiner"`

echo -e "\n    **** New Menu: "
echo -e "\n    $new_menu"

# 6. CREATE NEW ITEM (ACCESS TOKEN) 


echo -e "\n######## CREATE NEW ITEM FOR CART "


new_item=`curl -s -k -H "Authorization: Bearer $owner_token"  -H "Content-Type: application/json" -X POST "http://$org-$env.$api_domain/$basepath/foodcarts/$cartid/items" -d '@testdata/item.json'`



echo -e "\n    **** New Item: "
echo -e "\n    $new_item"


# 7. ADD ITEM TO MENU (ACCESS TOKEN)  (FAILS)


echo -e "\n**** ADD ITEM TO MENU"


#updated_menu=`curl -s -k -H "Authorization: Bearer $owner_token"  -H "Content-Type: application/json" -X POST "http://$org-$env.$api_domain/$basepath/menus/$menuid/items/$new_item" -d '$new_item'`
updated_menu=`curl -s -k -H "Authorization: Bearer $owner_token"  -H "Content-Type: application/json" -X POST "http://$org-$env.$api_domain/$basepath/menus/$menuid/items/$new_item"`



echo -e "\n    **** Updated Menu: "
echo -e "\n    $updated_menu"







