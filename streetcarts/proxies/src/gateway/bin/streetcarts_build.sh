
#!/bin/sh

# Change the following as appropriate
stty_orig=`stty -g` # save original terminal setting.

usage() {
    CMD=`basename $0`
    echo "Usage:"
    echo "$CMD [-u email] [-p password] [-o org-name] [-e env] [-d deployenv] [-r rev] [-x proxyhost]"
    echo "              username:       email address of Edge user"
    echo "              password:       password of Edge user"
    echo "              org-name:       name of existing organization"
    echo "              env:            management API URL as https://api.enterprise.apigee.com or https://api.e2e.apigee.net"
    echo "              deployenv:      the environment the proxies are deployed to"
    echo "              rev:            data manager proxy current revision"
    echo "              proxyhost:      the host part of the URL to your API proxies"
    exit 1
}

while getopts "u:p:o:e:d:r:x:h" opt; do
case $opt in
# variable options
    u)  username=$OPTARG ;;
    p)  password=$OPTARG ;;
    o)  org=$OPTARG ;;
    e)  env=$OPTARG ;;
    d)  deployenv=$OPTARG ;;
    r)  rev=$OPTARG ;;
    x)  proxyhost=$OPTARG ;;
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
echo "\n";
if [ -z "${org}" ]; then
    read -p "Apigee organization name: " org
fi

if [ -z "${env}" ]; then
    ENV_DEFAULT="https://api.enterprise.apigee.com"
    read -p "Management API URL as https://api.enterprise.apigee.com or https://api.e2e.apigee.net [$ENV_DEFAULT]: " env
    env="${env:-$ENV_DEFAULT}"
fi
if [ $env = "https://api.e2e.apigee.net" ]; then
        server=".e2e"
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
if [ -z "${proxyhost}" ]; then
    PROXYHOST_DEFAULT="$org-$deployenv$server.apigee.net"
    read -p "Host for API proxies, such as myorg-myenv.apigee.net [$PROXYHOST_DEFAULT]: " proxyhost
    proxyhost="${proxyhost:-$PROXYHOST_DEFAULT}"
fi


# Verify Apigee admin credentials

source ./verify.sh

# clone the GitHub repo
cd ../../../../../../
git pull https://github.com/apigee/docs-sandbox
cd apps/streetcarts/proxies/src/gateway


# Deploy the API proxies with Maven
# The -Doptions=clean undeploys and deletes the existing revision
# -Dproxyhost contains a value that is used by Maven to auto-replace URLs in the proxy config files.

cd accesstoken
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Dproxyhost=$proxyhost
rm -r target
cd ..

cd foodcarts
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Dproxyhost=$proxyhost
rm -r target
cd ..

cd items
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Dproxyhost=$proxyhost
rm -r target
cd ..

cd menus
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Dproxyhost=$proxyhost
rm -r target
cd ..

cd reviews
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Dproxyhost=$proxyhost
rm -r target
cd ..

cd data-manager
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Dproxyhost=$proxyhost
rm -r target
cd ..

cd users
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Doptions=clean
mvn install -P test -Dusername=$username -Dpassword=$password -Dorg=$org -Denv=$env -Dproxyhost=$proxyhost
rm -r target
cd ..

# Install the Node.js dependencies for the data-manager proxy, then redeploy the proxy

curl -v -X POST --header "Content-Type: application/x-www-form-urlencoded" -u $username:$password -d "command=install" "$env/v1/organizations/$org/apis/data-manager/revisions/$rev/npm"

curl -v -X DELETE -u $username:$password "$env/v1/organizations/$org/environments/$deployenv/apis/data-manager/revisions/$rev/deployments"

curl -v -X POST -u $username:$password "$env/v1/organizations/$org/environments/$deployenv/apis/data-manager/revisions/$rev/deployments?override=true"


# Call the setup.sh script to boostrap products, developers, and apps
cd bin
source ./main.sh

