# StreetCarts API Proxy

### Deploy, setup, use

1. Clone the docs-sandbox .
2. `cd` to `docs-sandbox/apps/streetcarts/bin`
3. Do `chmod 755 *.sh`
4. Open `setenv.sh` in an editor and add your Apigee Edge org information to it. 

    Like this:
    ```
       org="docs" //  your org name
       username="wwitman@apigee.com"  // your apigee email address
       url="https://api.enterprise.apigee.com"  // don't edit
       env="test"  // your environment
       api_domain="apigee.net" // don't edit
    ```

5. Save the file.
4. Execute: `./main.sh`
5. Respond to the prompts as follows:

   ```
   1. Do you want to deploy the proxy? ([y]/n):

      Say "y" if have never deployed the proxy, or if you've made changes and want to redeploy it. 

   2. Do you want to cleanup entities? ([y]/n):

       Say "y" if you want to remove the products, developers, and developer apps that this script creates. I usually say "y" to this. It's probably a good idea to always select this. It doesn't hurt. But you only have to do it if you changed one of the entities and want to recreate them. 

   3. Do you want to add entities? ([y]/n):

       Say "y" if you are running this script for the first time, or if you have run the cleanup. It creates products, developers, and developer apps that are used by the proxy for testing. 

   4. Do you want to invoke? ([y]/n):

       Say "y" to run a test API calls. Currently, invoke.sh does these two things:

       a. It gets the key:secret for a developer app.
       b. It forms/makes a curl call to our proxy to get an access token and user ID.
       c. It forms/makes a curl call against our API. Currently, the only one 
          I have in there is:

          https://docs-test.apigee.net/streetcarts/users/{userid}/carts

          which returns the carts owned by the user.

   ```
