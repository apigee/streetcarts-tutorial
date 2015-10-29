#!/bin/sh


# Install API Products


echo  -e "\n**** CREATING ADMIN PRODUCT"
curl -u $username:$password $url/v1/o/$org/apiproducts \
  -H "Content-Type: application/json" -X POST -T ./entities/$proxy-admin-product.json

echo  -e "\n**** CREATING OWNER PRODUCT"
curl -u $username:$password $url/v1/o/$org/apiproducts \
  -H "Content-Type: application/json" -X POST -T ./entities/$proxy-owner-product.json

echo  -e "\n**** CREATING FREE PRODUCT"
curl -u $username:$password $url/v1/o/$org/apiproducts \
  -H "Content-Type: application/json" -X POST -T ./entities/$proxy-free-product.json

echo  -e "\n**** CREATING DEVELOPER"
curl -u $username:$password $url/v1/o/$org/developers \
  -H "Content-Type: application/xml" -X POST -T ./entities/$proxy-developer.xml

echo  -e "\n**** CREATING OWNER APP"
curl -u $username:$password \
  $url/v1/o/$org/developers/$proxy@sample.com/apps \
  -H "Content-Type: application/json" -X POST -T ./entities/$proxy-owner-app.json


echo  -e "\n**** CREATING ADMIN APP"
curl -u $username:$password \
  $url/v1/o/$org/developers/$proxy@sample.com/apps \
  -H "Content-Type: application/json" -X POST -T ./entities/$proxy-admin-app.json



echo -e "\nGET KEY AND SECRET FROM THE ADMIN APP"

ks=`curl -u "$username:$password" "$url/v1/o/$org/developers/$proxy@sample.com/apps/$proxy-admin-app" 2>/dev/null | egrep "consumer(Key|Secret)"`
key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`


echo -e "\n**** Got Consumer Key for Admnin App: $key ****"
echo -e "\n**** Got Consumer Secret for Admin App: $secret ****"

echo -e "\n**** ASSOCIATE THE KEY WITH THE ADMIN PRODUCT"
curl -u $username:$password \
  $url/v1/o/$org/developers/$proxy@sample.com/apps/$proxy-admin-app/keys/${key} \
  -H "Content-Type: application/json" -X POST -d '{"apiproducts": ["{streetcarts-admin-product}"]}'

echo -e "\n**** BASE64 ENCODE THE KEY:SECRET FOR THE ADMIN APP"
auth=$(echo -ne "$key:$secret" | base64);
echo -e "\n**** Base64 encoded credentials:  $auth ****"





echo -e "\nGET KEY AND SECRET FROM THE OWNER APP"

ks=`curl -u "$username:$password" "$url/v1/o/$org/developers/$proxy@sample.com/apps/$proxy-owner-app" 2>/dev/null | egrep "consumer(Key|Secret)"`
key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`


echo -e "\n**** Got Consumer Key for Owner App: $key ****"
echo -e "\n**** Got Consumer Secret for Owner App: $secret ****"

echo -e "\n**** ASSOCIATE THE KEY WITH THE OWNER PRODUCT"
curl -u $username:$password \
  $url/v1/o/$org/developers/$proxy@sample.com/apps/$proxy-owner-app/keys/${key} \
  -H "Content-Type: application/json" -X POST -d '{"apiproducts": ["{streetcarts-owner-product}"]}'

echo -e "\n**** BASE64 ENCODE THE KEY:SECRET FOR THE OWNER APP"
auth=$(echo -ne "$key:$secret" | base64);
echo -e "\n**** Base64 encoded credentials:  $auth ****"



echo  -e "\n**** CREATING FREE APP"
curl -u $username:$password \
  $url/v1/o/$org/developers/$proxy@sample.com/apps \
  -H "Content-Type: application/json" -X POST -T ./entities/$proxy-free-app.json

echo -e "\nGET KEY AND SECRET FROM THE FREE APP"

ks=`curl -u "$username:$password" "$url/v1/o/$org/developers/$proxy@sample.com/apps/$proxy-free-app" 2>/dev/null | egrep "consumer(Key|Secret)"`
key=`echo $ks | awk -F '\"' '{ print $4 }'`
secret=`echo $ks | awk -F '\"' '{ print $8 }'`


echo -e "\n**** Got Consumer Key for Free App: $key ****"
echo -e "\n**** Got Consumer Secret for Free App: $secret ****"

echo -e "\n**** ASSOCIATE THE KEY WITH THE FREE PRODUCT"
curl -u $username:$password \
  $url/v1/o/$org/developers/$proxy@sample.com/apps/$proxy-free-app/keys/${key} \
  -H "Content-Type: application/json" -X POST -d '{"apiproducts": ["{streetcarts-free-product}"]}'

echo -e "\n**** BASE64 ENCODE THE KEY:SECRET FOR THE FREE APP"
auth=$(echo -ne "$key:$secret" | base64);
echo -e "\n**** Base64 encoded credentials:  $auth ****"

