#!/bin/sh

echo -e "\n**** Deleting Apps"

curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com/apps/SC-OWNER-APP -X DELETE

curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com/apps/SC-PUBLIC-APP -X DELETE


echo -e "\n**** Deleting Developers"

curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com -X DELETE


echo -e "\n**** Deleting Products"

curl -u $username:$password $url/v1/o/$org/apiproducts/SC-PUBLIC-PRODUCT -X DELETE
curl -u $username:$password $url/v1/o/$org/apiproducts/SC-OWNER-PRODUCT -X DELETE

echo -e "\n**** Cleanup Completed"
