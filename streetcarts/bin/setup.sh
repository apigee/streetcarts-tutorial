#!/bin/sh


# Create a Developer

echo  -e "\n**** CREATING DEVELOPER"
curl -u $username:$password $url/v1/o/$org/developers \
  -H "Content-Type: application/xml" -X POST -T ./entities/SC-DEVELOPER.xml

# Create API Products

echo  -e "\n**** CREATING SC-OWNER-PRODUCT"
curl -u $username:$password $url/v1/o/$org/apiproducts \
  -H "Content-Type: application/json" -X POST -T ./entities/SC-OWNER-PRODUCT.json

echo  -e "\n**** CREATING SC-PUBLIC-PRODUCT"
curl -u $username:$password $url/v1/o/$org/apiproducts \
  -H "Content-Type: application/json" -X POST -T ./entities/SC-PUBLIC-PRODUCT.json


# Create Developer Apps

echo  -e "\n**** CREATING SC-OWNER-APP"
curl -u $username:$password \
  $url/v1/o/$org/developers/will@streetcarts.com/apps \
  -H "Content-Type: application/json" -X POST -T ./entities/SC-OWNER-APP.json


echo  -e "\n**** CREATING SC-PUBLIC-APP"
curl -u $username:$password \
  $url/v1/o/$org/developers/will@streetcarts.com/apps \
  -H "Content-Type: application/json" -X POST -T ./entities/SC-PUBLIC-APP.json



echo -e "\n**** GET KEY AND SECRET FROM THE OWNER APP"

ks=`curl -u "$username:$password" "$url/v1/o/$org/developers/will@streetcarts.com/apps/sc-owner-app" 2>/dev/null | egrep "consumer(Key|Secret)"`
key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`


echo -e "\n**** Got Consumer Key for Owner App: $key ****"
echo -e "\n**** Got Consumer Secret for Owner App: $secret ****"

echo -e "\n**** ASSOCIATE THE KEY WITH THE SC-OWNER-PRODUCT"

curl -u $username:$password \
  $url/v1/o/$org/developers/will@streetcarts.com/apps/sc-owner-app/keys/${key} \
  -H "Content-Type: application/json" -X POST -d '{"apiproducts": ["{sc-owner-product}"]}'


echo -e "\n**** BASE64 ENCODE THE KEY:SECRET FOR THE OWNER APP"

auth=$(echo -ne "$key:$secret" | base64);
echo -e "\n**** Base64 encoded credentials:  $auth ****"



echo -e "\n**** GET KEYS FROM THE PUBLIC APP"

ks=`curl -u "$username:$password" "$url/v1/o/$org/developers/will@streetcarts.com/apps/sc-public-app" 2>/dev/null | egrep "consumer(Key|Secret)"`
key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`


echo -e "\n**** Got Consumer Key for Public App: $key ****"
echo -e "\n**** Got Consumer Secret for Public App: $secret ****"

echo -e "\n**** ASSOCIATE THE KEY WITH THE PUBLIC PRODUCT"
curl -u $username:$password \
  $url/v1/o/$org/developers/will@streetcarts.com/apps/sc-public-app/keys/${key} \
  -H "Content-Type: application/json" -X POST -d '{"apiproducts": ["{sc-public-product}"]}'

echo -e "\n**** BASE64 ENCODE THE KEY:SECRET FOR THE PUBLIC APP"
auth=$(echo -ne "$key:$secret" | base64);
echo -e "\n**** Base64 encoded credentials:  $auth ****"

echo "DONE CREATING ENTITIES"

