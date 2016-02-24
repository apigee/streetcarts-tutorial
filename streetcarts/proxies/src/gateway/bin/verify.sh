response=`curl -s -o /dev/null -I -w "%{http_code}" $env/v1/organizations/$org -u $username:$password`

if [ $response -eq 401 ]
then
  echo -e "\n**** Authentication failed! ****"
  echo -e "\n**** Please re-run the script using the right username/password. **** "
  exit
elif [ $response -eq 403 ]
then
  echo -e "\n**** Organization $org is invalid! ****"
  echo -e "\n**** Please re-run the script using the right org. ****"
  exit
elif [ $response -eq 404 ]
then
  echo -e "\n**** Organization $org is invalid! ****"
  echo -e "\n**** Please re-run the script using the right org. ****"
  exit
else
  echo -e "******************************************************************"
  echo -e "*    Username/password verfied! Proceeding with deployment.      *"
  echo -e "******************************************************************"
fi;
