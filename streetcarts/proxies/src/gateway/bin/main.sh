#!/bin/bash


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

echo -e

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


# Build the API proxies

echo -e "\nDo you want to build and deploy the StreetCarts proxies? ([y]/n):"
read build

if [ -z $build ] || [ "$build" = "y" ]; then
  source ./streetcarts_build.sh
fi


# Sample API products, developer, and apps

echo -e "\nDo you want to clean up existing API products, developers, and apps for StreetCarts? ([y]/n):"
read cleanup

if [ -z $cleanup ] || [ "$cleanup" = "y" ]; then
  source ./apps_cleanup.sh
fi

echo -e "\nDo you want to create sample API products, developers, and apps to run StreetCarts? ([y]/n):"
read setup

if [ -z $setup ] || [ "$setup" = "y" ]; then
  source ./apps_setup.sh
fi
