# StreetCarts API Proxy

### Set up and deploy the API

Following are instructions for setting up and deploying the StreetCarts app to Edge. Scripts are provided to make things easy to manage. 


#### About the scripts

Unless indicated otherwise, the scripts are in `smartcarts/proxies/src/gateway/bin`.

* `main.sh` provisions products, developer apps, and a developer to your Edge organization. You should only need to do this once, and after that, only if you edit any of these entity files.  
* `setenv.sh` where you put your Edge account info used by other scripts. 
* `streetcarts-build.sh` runs the Maven sync/deploy operations. Covered in another [README](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/proxies/src/gateway). This one is in `smartcarts/proxies/src/gateway`. 
* `invoke.sh` is OBSOLETE. DO NOT USE. Recommend using the Postman collection for testing APIs. 

#### About Sync and Deploy using Maven

Maven is used to sync to GitHub and deploy to Edge. To set things up, follow this [README](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/proxies/src/gateway). 

#### Provision developer apps and products

1. Clone the docs-sandbox .
2. `cd` to `docs-sandbox/apps/streetcarts/proxies/src/gateway/bin`
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

   1. `Do you want to cleanup entities? ([y]/n):`

       Say "y" if you want to remove the products, developers, and developer apps that this script creates. I usually say "y" to this. It's probably a good idea to always select this. It doesn't hurt. But you only have to do it if you changed one of the entities and want to recreate them. 

   2. `Do you want to add entities? ([y]/n):`

       Say "y" if you are running this script for the first time, or if you have run the cleanup. It creates products, developers, and developer apps that are used by the proxy for testing. 



#### Provision data manager API key

The Data Manager needs to validate an API key for each API call it receives. This is protect against someone hitting the Data Manager without going through Edge. 

**Note:** If you previously created the KV map, then redeployed everything, you'll have to delete the previous map and recreate it as explained below. 

Here's how to get the api key for YOUR data manager into YOUR key value map -- the map is scoped to your org, so you (as org admin) need to do these steps to provision the API key into a KV map in your org:

1. Copy the Consumer Key from the developer app called `SC-DATA-MANAGER-APP` -- this key is the API key you must provision per the following steps. It is passed with every API call to the data manager.

1. Go to [this SmartDoc page](http://apigee.com/docs/management/apis/post/organizations/%7Borg_name%7D/keyvaluemaps).

2. Call the api to create a key value map in your org, like this:

    `https://api.enterprise.apigee.com/v1/organizations/YOUR ORG NAME/keyvaluemaps`

    Where this is the JSON body:

  ```
  {   
   "name" : "DATA-MANAGER-API-KEY",
   "entry" : [ 
    {
     "name" : "X-DATA-MANAGER-KEY",
     "value" : “THE CONSMER KEY FROM YOUR SC-DATA-MANAGER-APP“
    }
   ]
  }
  ```





#### Developing proxies

These are the steps -- good luck!

1. Decide what you want to implement and make sure it isn't already. 
3. Take some time to examine one of the existing APIs. Some of the APIs require just an API key and others require an OAuth token. Token is required for the "owner" APIs. Look at other APIs that work and follow the pattern.  
4. Open the `default.xml` file for the Target Endpoint, and notice that the TargetConnection points to the data-manager proxy. 

    **Important:** 

    Make these  changes in EVERY proxy EXCEPT data-manager and accesstoken.

    * In the default TargetEndpoint, make sure the default target URL matches your org-name and environment. (For example, if you're an Apigeek deploying in the internal e2e environment, the base URL should be https://{org}-{env}.**e2e**.apigee.net). Do not change the 'production` target URL. It points to the internal Apigee e2e environment and should not be changed. 
        
    * In the ProxyEndpoint, make sure the RouteRule for the default TargetEndpoint is your org name. 
         
6. Think about if the API needs an OAuth token or if just an API key will do. Most of the APIs that let you edit things require a token. The public APIs just need a key.
7. In your flow along the lines of this example. Be sure to set the condition property appropriately:

   If you're doing Token validation, like this:

    ```
          <Flow name="Update Menu Item">
                <Description>Update Menu Item</Description>
                <Request>
                    <Step>
                        <Name>SetRestrictedResource</Name>
                    </Step>
                    <Step>
                        <Name>ValidateToken</Name>
                    </Step>
                </Request>
                <Response/>
                <Condition>(proxy.pathsuffix MatchesPath "/{menu_id}/item") and (request.verb = "PUT")</Condition>
            </Flow>
    ```

    If you're doing API KEY validation, like this:

    ```
          <Flow name="GetFoodcart">
                <Description>Get a Foodcart</Description>
                <Request>
                    <Step>
                        <Name>SetRestrictedResource</Name>
                    </Step>
                    <Step>
                        <Name>VerifyAPIKey</Name>
                    </Step>
                    <Step>
                        <Name>RemoveAPIKey</Name>
                    </Step>
                </Request>
                <Response/>
                <Condition>(proxy.pathsuffix MatchesPath "/{cart_id}") and (request.verb = "GET")</Condition>
            </Flow>
    ```


8. Save the proxy.
9. Open the product called `SC-OWNER-PRODUCT`, and follow the pattern to add your proxy to the product. You'll need to add something like `/PUT/v1/streetcarts/menus`. This is the path that Edge checks to make sure the token is valid. It is set in the proxy flow by the SetRestrictedResource JavaScript policy. 
10. Add your API to a test script. You can hack invoke.sh or test-menus.sh or test-users.sh to get something going. 
11. A lot of the time, some debugging is required. 
11. Call your test script as many times as it takes to get the API debugged and working properly. 

#### API keys and Tokens

* If you need an API key, the best bet is to take the Consumer Key in the Developer App called "SC-OWNER-APP". 
* If you need Token validation, you can run the `invoke.sh` script and it'll go through steps to generate a token against the key/secret in SC-OWNER-APP, and it should work. 

#### Keeping things in sync

The proxies are XML files, and they exist in two places -- the ones that are deployed to Edge and the ones on your file system. 

Maven does a good job of deploying from your local system to Edge. However, you'll quickly find that you're tweaking things in the Edge UI as you're debugging or trying things out. When you do this, it's very easy to forget to copy your changes back to your local files. If you don't copy the changes down, the next time you deploy they will be lost. 

We need to find a better way to handle keeping things in sync, because this manual copying is a pain. 

