
accesstoken_response='{"token" : f8kwksJBCDJ6GUiV6HWfF2IOrQnY, "ownerId" : abc12345678}'

userid1=`echo $accesstoken_response | awk -F ':' '{ print $3 }'`
userid2=`echo $userid1 | cut -d'}' -f 1`
echo -e "\n**** Got Owner ID 2: $userid2"

