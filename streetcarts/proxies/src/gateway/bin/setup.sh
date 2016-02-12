#!/bin/sh


# Create a Developer

echo  -e "\n**** CREATING DEVELOPER"
curl -u $username:$password $env/v1/o/$org/developers \
  -H "Content-Type: application/xml" -X POST -T ./entities/SC-DEVELOPER.xml

# Create API Products

echo  -e "\n**** CREATING SC-PRODUCT-TRIAL"
curl -u $username:$password $env/v1/o/$org/apiproducts \
  -H "Content-Type: application/json" -X POST -T ./entities/SC-PRODUCT-TRIAL.json

echo  -e "\n**** CREATING SC-PRODUCT-UNLIMITED"
curl -u $username:$password $env/v1/o/$org/apiproducts \
  -H "Content-Type: application/json" -X POST -T ./entities/SC-PRODUCT-UNLIMITED.json

  echo  -e "\n**** CREATING SC-DATA-MANAGER-PRODUCT"
curl -u $username:$password $env/v1/o/$org/apiproducts \
  -H "Content-Type: application/json" -X POST -T ./entities/SC-DATA-MANAGER-PRODUCT.json


# Create Developer Apps

echo  -e "\n**** CREATING SC-APP-TRIAL"
curl -u $username:$password \
  $env/v1/o/$org/developers/streetcarts@example.com/apps \
  -H "Content-Type: application/json" -X POST -T ./entities/SC-APP-TRIAL.json

echo  -e "\n**** CREATING SC-APP-UNLIMITED"
curl -u $username:$password \
  $env/v1/o/$org/developers/streetcarts@example.com/apps \
  -H "Content-Type: application/json" -X POST -T ./entities/SC-APP-UNLIMITED.json

 echo  -e "\n**** CREATING SC-DATA-MANAGER-APP"
curl -u $username:$password \
  $env/v1/o/$org/developers/streetcarts@example.com/apps \
  -H "Content-Type: application/json" -X POST -T ./entities/SC-DATA-MANAGER-APP.json


echo -e "\n**** GET KEY AND SECRET FROM SC-APP-TRIAL"

ks=`curl -u "$username:$password" "$env/v1/o/$org/developers/streetcarts@example.com/apps/sc-app-trial" 2>/dev/null | egrep "consumer(Key|Secret)"`
key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`


echo -e "\n**** Got Consumer Key for Trial App: $key ****"
echo -e "\n**** Got Consumer Secret for Trial: $secret ****"

echo -e "\n**** ASSOCIATE THE KEY WITH THE SC-PRODUCT-TRIAL"

curl -u $username:$password \
  $env/v1/o/$org/developers/streetcarts@example.com/apps/sc-app-trial/keys/${key} \
  -H "Content-Type: application/json" -X POST -d '{"apiproducts": ["{sc-product-trial}"]}'


echo -e "\n**** BASE64 ENCODE THE KEY:SECRET FOR THE TRIAL APP"

auth=$(echo -ne "$key:$secret" | base64);
echo -e "\n**** Base64 encoded credentials:  $auth ****"






echo -e "\n**** GET KEY AND SECRET FROM SC-APP-UNLIMITED"

ks=`curl -u "$username:$password" "$env/v1/o/$org/developers/streetcarts@example.com/apps/sc-app-unlimited" 2>/dev/null | egrep "consumer(Key|Secret)"`
key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`


echo -e "\n**** Got Consumer Key for Unlimited App: $key ****"
echo -e "\n**** Got Consumer Secret for Unlimited: $secret ****"

echo -e "\n**** ASSOCIATE THE KEY WITH THE SC-PRODUCT-UNLIMITED"

curl -u $username:$password \
  $env/v1/o/$org/developers/streetcarts@example.com/apps/sc-app-unlimited/keys/${key} \
  -H "Content-Type: application/json" -X POST -d '{"apiproducts": ["{sc-product-unlimited}"]}'


echo -e "\n**** BASE64 ENCODE THE KEY:SECRET FOR THE TRIAL APP"

auth=$(echo -ne "$key:$secret" | base64);
echo -e "\n**** Base64 encoded credentials:  $auth ****"



echo -e "\n**** GET KEYS FROM THE DATA-MANAGER APP"

ks=`curl -u "$username:$password" "$env/v1/o/$org/developers/streetcarts@example.com/apps/SC-DATA-MANAGER-APP" 2>/dev/null | egrep "consumer(Key|Secret)"`
key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`


echo -e "\n**** Got Consumer Key for Data Manager App: $key ****"
echo -e "\n**** Got Consumer Secret for Data Manager App: $secret ****"

echo -e "\n**** ASSOCIATE THE KEY WITH THE DATA MANAGER PRODUCT"
curl -u $username:$password \
  $env/v1/o/$org/developers/streetcarts@example.com/apps/SC-DATA-MANAGER-APP/keys/${key} \
  -H "Content-Type: application/json" -X POST -d '{"apiproducts": ["{SC-DATA-MANAGER-PRODUCT}"]}'

echo -e "\n**** BASE64 ENCODE THE KEY:SECRET FOR THE DATA-MANAGER APP"
auth=$(echo -ne "$key:$secret" | base64);
echo -e "\n**** Base64 encoded credentials:  $auth ****"




echo "DONE CREATING ENTITIES"

