# StreetCarts API Proxy


Follow these instructions to set up StreetCarts on Edge. 

### Deploy the proxies

Use Maven to deploy the proxies. For details, see this [README](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/proxies/src/gateway). 

### Deploy products, apps, and developers

You must deploy the product, app, and developer entities. These entities provide the keys used for API key and OAuth validation. 

1. Change directory to `smartcarts/proxies/src/gateway/bin`.
2. Edit the file `setenv.sh` with your user and org information.
3. Execute `main.sh` and follow the prompts:

    ```
      chmod 755 *.sh
      ./main.sh
    ```

This script provisions the entities to your Edge organization. You should only need to do this once, and after that, only if you edit any of these entity files. 

>Note: Everytime you provision entities, you'll get a new key/secret pair. You'll have to use the new keys in any API calls. For example, if you're using Postman, be sure to update the keys that are set in your Postman environment. 

Here are the prompts you'll see when you run `main.sh`:

1. `Do you want to cleanup entities? ([y]/n):`

       Say "y" if you want to remove the products, developers, and developer apps that this script creates. I usually say "y" to this. It's probably a good idea to always select this. It doesn't hurt. But you only have to do it if you changed one of the entities and want to recreate them. 

   2. `Do you want to add entities? ([y]/n):`

       Say "y" if you are running this script for the first time, or if you have run the cleanup. It creates products, developers, and developer apps that are used by the proxy for testing. 


### Provision data manager API key

The data manager proxy requires its own API key. This is to prevent anyone from simply calling the data manager proxy without going through the front door, so to speak. 

We provision this key to a key/value map on Edge. It's safe there, and only an Edge org administrator has access to it. Once it's provisioned, it never expires. All of the proxies that call the data manager (foodcarts, menus, items, etc) use this key. 

>We are doing a form of proxy chaining here, where one proxy calls another. For example foodcarts -> data_manager. 

1. Copy the Consumer Key from the developer app called `SC-DATA-MANAGER-APP`.

1. Go to [this SmartDoc page](http://apigee.com/docs/management/apis/post/organizations/%7Borg_name%7D/keyvaluemaps).

2. Call this API to create a key value map in your org, like this:

    `https://api.enterprise.apigee.com/v1/organizations/YOUR ORG NAME/keyvaluemaps`

    Where this is the JSON body:

  ```
  {   
   "name" : "DATA-MANAGER-API-KEY",
   "entry" : [ 
    {
     "name" : "X-DATA-MANAGER-KEY",
     "value" : "THE CONSMER KEY FROM YOUR SC-DATA-MANAGER-APP"
    }
   ]
  }
  ```


### Using Postman to make API calls

Steve Traut created Postman environments and collections. The are located [here](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/test/postman). Download the most recent environment and collection. Then edit your environment with the keys, org, etc for your setup. 

### Quick test

Make a call that doesn't require an OAuth token, like this:

curl http://docs-test.apigee.net/v1/streetcarts/foodcarts -H 'x-api-key: <your api key>'

Grab the API key from either the SC-APP-TRIAL or SC-APP-UNLIMITED apps. 


### Using OAuth

Some of the proxies require an OAuth token. Using the Postman collection, you get tokens like this:

1. Call the `Register user` API. This API creates a new user with a username and password.
2. Call the `Authenticate user` API to generate an access token. 
    1. Set the Basic Auth with username/password as the client key/secret for one of the provisioned developer apps.
    2. Be sure to pass the scope header. Scopes set what the user can do. 

    If the user is a cart owner, pass these scopes:

    `owner.create owner.update owner.read owner.delete`

    If the user is a cart manager, pass these scopes:

    `manager.update manager.read`



### About the Authenticate API calls







