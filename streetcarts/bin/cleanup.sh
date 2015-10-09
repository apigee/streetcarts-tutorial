#!/bin/sh

echo -e "\n**** Deleting Apps"

curl -u $username:$password $url/v1/o/$org/developers/$proxy@sample.com/apps/$proxy-owner-app -X DELETE

curl -u $username:$password $url/v1/o/$org/developers/$proxy@sample.com/apps/$proxy-free-app -X DELETE

echo -e "\n**** Deleting Developers"

curl -u $username:$password $url/v1/o/$org/developers/$proxy@sample.com -X DELETE


echo -e "\n**** Deleting Products"

curl -u $username:$password $url/v1/o/$org/apiproducts/$proxy-free-product -X DELETE
curl -u $username:$password $url/v1/o/$org/apiproducts/$proxy-owner-product -X DELETE

echo -e "\n**** Cleanup Completed"
