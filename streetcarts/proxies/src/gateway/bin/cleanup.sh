#!/bin/sh

echo -e "\n**** Deleting Apps"

curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com/apps/sc-owner-app -X DELETE
curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com/apps/sc-public-app -X DELETE
curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com/apps/SC-DATA-MANAGER-AUTH-APP -X DELETE


echo -e "\n**** Deleting Developers"

curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com -X DELETE


echo -e "\n**** Deleting Products"

curl -u $username:$password $url/v1/o/$org/apiproducts/sc-public-product -X DELETE
curl -u $username:$password $url/v1/o/$org/apiproducts/sc-owner-product -X DELETE
curl -u $username:$password $url/v1/o/$org/apiproducts/SC-DATA-MANAGER-AUTH-PRODUCT -X DELETE

echo -e "\n**** Cleanup Completed"
