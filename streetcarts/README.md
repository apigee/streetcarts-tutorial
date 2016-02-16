# StreetCarts API Proxy


Follow these instructions to set up StreetCarts on Edge. 

### Deploy the proxies

Use Maven to deploy the proxies. For details, see this [README](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/proxies/src/gateway). 

The basic steps are:

1. Change directory to: `docs-sandbox/apps/streetcarts/proxies/src/gateway`
2. `chmod 755 *.sh`
3. `./main.sh`

Follow the prompts to:
* Enter Edge credentials and other information
* Deploy all proxies (the sync to GitHub happens as part of the script)
* Clean up (delete) existing StreetCarts apps, developers, and products
* Create new StreetCarts apps, developers, and products, and add the Data Manager App key to the KVM.
  (The StreetCarts APIs require this.)

  This script provisions the entities to your Edge organization. You should only need to do this once, and after that, only if you edit any of these entity files. 

  >Note: Every time you provision entities, you'll get a new key/secret pair. You'll have to use the new keys in any API calls. For example, if you're using Postman, be sure to update the keys that are set in your Postman environment.

### Using Postman to make API calls

Steve Traut created Postman environments and collections. The are located [here](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/test/postman). Download the most recent environment and collection. Then edit your environment with the keys, org, etc for your setup. 

### Quick test

Make a call that doesn't require an OAuth token, like this:

curl http://<your_org>}-test.apigee.net/v1/streetcarts/foodcarts -H 'x-api-key: <your api key>'

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







