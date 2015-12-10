
#!/bin/sh

# Change the following as appropriate
stty_orig=`stty -g` # save original terminal setting.

usage() {
    CMD=`basename $0`
    echo "Usage:"
    echo "$CMD [-u email] [-p password] [-o org-name] [-e environment] [-d deployenv] [-r rev]"
    echo "              email:          email address of Edge user"
    echo "              password:       password of Edge user"
    echo "              org-name:       name of existing organization"
    echo "              environment:    environment as https://api.enterprise.apigee.com or https://api.e2e.apigee.net"
    echo "              deployenv:      the environment the proxies are deployed to"
    echo "              rev:            data manager proxy current revision"
    exit 1
}

while getopts "u:p:o:e:d:r:h" opt; do
case $opt in
# variable options
    u)  username=$OPTARG ;;
    p)  password=$OPTARG ;;
    o)  org=$OPTARG ;;
    e)  env=$OPTARG ;;
    d)  deployenv=$OPTARG ;;
    r)  rev=$OPTARG ;;
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

if [ -z "${deployenv}" ]; then
    DEPLOYENV_DEFAULT="test"
    read -p "Environment to deploy to, such as test or prod [$DEPLOYENV_DEFAULT]: " deployenv
    deployenv="${deployenv:-$DEPLOYENV_DEFAULT}"
fi

if [ -z "${rev}" ]; then
    REV_DEFAULT="1"
    read -p "The current revision of the data-manager proxy [$REV_DEFAULT]: " rev
    rev="${rev:-$REV_DEFAULT}"
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

curl -v -X POST --header "Content-Type: application/x-www-form-urlencoded" -u $username:$password -d "command=install" "$env/v1/organizations/$org/apis/data-manager/revisions/$rev/npm"

curl -v -X DELETE -u $username:$password "$env/v1/organizations/$org/environments/$deployenv/apis/data-manager/revisions/$rev/deployments"

curl -v -X POST -u $username:$password "$env/v1/organizations/$org/environments/$deployenv/apis/data-manager/revisions/$rev/deployments?override=true"



