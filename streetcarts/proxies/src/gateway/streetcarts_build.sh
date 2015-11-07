
#!/bin/sh

# Change the following as appropriate

stty_orig=`stty -g` # save original terminal setting.
read -p "Apigee email: " username
read -sp "Password: " password

org=wwitman

cd ../../../../../
git pull https://github.com/apigee/docs-sandbox
cd apps/streetcarts/proxies/src/gateway


# The -Doptions=clean undeploys and deletes the existing revision

cd accesstoken
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
rm -r target
cd ..

cd foodcarts
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
rm -r target
cd ..

cd items
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
rm -r target
cd ..

cd menus
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
rm -r target
cd ..

cd reviews
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
rm -r target
cd ..

cd data-manager
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
rm -r target
cd ..

cd users
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
rm -r target
cd ..





