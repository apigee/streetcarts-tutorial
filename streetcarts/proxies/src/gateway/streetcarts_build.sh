
#!/bin/sh

# Change the following as appropriate
stty_orig=`stty -g` # save original terminal setting.

usage() {
    CMD=`basename $0`
    echo "Usage:"
    echo "$CMD [-u email] [-p password] [-o org-name] [-e environment]"
    echo "              email:          email address of Edge user"
    echo "              password:       password of Edge user"
    echo "              org-name:       name of existing organization"
    echo "              environment:    environment as https://api.enterprise.apigee.com or https://api.e2e.apigee.net"
    exit 1
}

while getopts "u:p:o:e:h" opt; do
case $opt in
# variable options
    u)  username=$OPTARG ;;
    p)  password=$OPTARG ;;
    o)  org=$OPTARG ;;
    e)  env=$OPTARG ;;
    h)  usage ;;
esac
done

# check to see
if [ -z "${username}" ]; then
    read -p "Apigee email: " username
fi

if [ -z "${password}" ]; then
    read -sp "Password: " password
fi

echo -e "\n";
if [ -z "${org}" ]; then
    read -p "org: " org
fi

if [ -z "${env}" ]; then
    ENV_DEFAULT="https://api.enterprise.apigee.com"
    read -p "Environment as https://api.enterprise.apigee.com or https://api.e2e.apigee.net [$ENV_DEFAULT]: " env
    env="${env:-$ENV_DEFAULT}"
fi


# org=sgilson

cd ../../../../../
git pull https://github.com/apigee/docs-sandbox
cd apps/streetcarts/proxies/src/gateway


# The -Doptions=clean undeploys and deletes the existing revision

cd accesstoken
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env
rm -r target
cd ..

cd foodcarts
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env
rm -r target
cd ..

cd items
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env
rm -r target
cd ..

cd menus
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env
rm -r target
cd ..

cd reviews
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env
rm -r target
cd ..

cd data-manager
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env
rm -r target
cd ..

cd users
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env
rm -r target
cd ..





