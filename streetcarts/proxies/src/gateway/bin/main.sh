#!/bin/bash


#if [ -z $org ]; then
#   source ./setenv.sh
#fi
#if [ -z $password ]; then
#   source ./pw.sh
#   source ./verify.sh
#fi


echo -e "\nDo you want to clean up existing API products, developers, and apps for StreetCarts? ([y]/n):"
read cleanup

if [ -z $cleanup ] || [ "$cleanup" = "y" ]; then
  source ./cleanup.sh
fi

echo -e "\nDo you want add sample API products, developers, and apps to run StreetCarts? ([y]/n):"
read setup

if [ -z $setup ] || [ "$setup" = "y" ]; then
  source ./setup.sh
fi
