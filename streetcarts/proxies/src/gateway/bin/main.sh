#!/bin/bash


if [ -z $org ]; then
   source ./setenv.sh
fi
if [ -z $password ]; then
   source ./pw.sh
   source ./verify.sh
fi


echo -e "\nDo you want to cleanup entities? ([y]/n):"
read cleanup

if [ -z $cleanup ] || [ "$cleanup" = "y" ]; then
  source ./cleanup.sh
fi

echo -e "\nDo you want to add entities? ([y]/n):"
read setup

if [ -z $setup ] || [ "$setup" = "y" ]; then
  source ./setup.sh
fi

echo -e "\nDo you want to invoke? ([y]/n):"
read invoke

if [ -z $invoke ] || [ "$invoke" = "y" ]; then
  source ./invoke.sh
fi
