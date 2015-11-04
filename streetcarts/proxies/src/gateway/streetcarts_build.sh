
#!/bin/sh

# Change the following as appropriate

username=user@apigee.com
password=your_password
org=docfood

# The -Doptions=clean undeploys and deletes the existing revision

cd accesstoken
# mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
cd ..

cd foodcarts
# mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
cd ..

cd items
# mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
cd ..

cd menus
# mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
cd ..

cd reviews
# mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
cd ..

cd users
# mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org
cd ..





