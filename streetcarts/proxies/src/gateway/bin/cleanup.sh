#!/bin/sh

echo -e "\n**** Deleting Apps"

curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com/apps/SC-APP-TRIAL -X DELETE
curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com/apps/SC-APP-UNLIMITED -X DELETE
curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com/apps/SC-DATA-MANAGER-APP -X DELETE



echo -e "\n**** Deleting Developers"

curl -u $username:$password $url/v1/o/$org/developers/will@streetcarts.com -X DELETE


echo -e "\n**** Deleting Products"

curl -u $username:$password $url/v1/o/$org/apiproducts/SC-PRODUCT-TRIAL -X DELETE
curl -u $username:$password $url/v1/o/$org/apiproducts/SC-PRODUCT-UNLIMITED -X DELETE
curl -u $username:$password $url/v1/o/$org/apiproducts/SC-DATA-MANAGER-PRODUCT -X DELETE


echo -e "\n**** Cleanup Completed"
