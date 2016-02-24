# StreetCarts API Proxies

StreetCarts is a full API application that integrates Apigee Edge with API BaaS to provide data about mobile food carts.

StreetCarts illustrates the following:

* Multiple client-facing proxies calling a single internal proxy to share a connection with a backend resource.
* Storing sensitive credential data in the Edge secure store (vault).
* Node.js modules to integrate an API BaaS data store with Edge proxies.
* Authentication with Edge OAuth policies.
* Authorization with API BaaS user groups, roles, and permissions.
* Enforcing two distinct client access levels with the Quota policy.
* Suppressing traffic spikes with the Spike Arrest policy.

![StreetCarts diagram](https://github.com/apigee/docs-sandbox/blob/master/apps/streetcarts/streetcarts-diagram.png).

## To install and use StreetCarts

You can experiment with the StreetCarts API by deploying its proxies to Edge and setting up an API BaaS application for its data. Once it's set up, you can use a client (such as Postman) to try out the API.

1. Clone this repository. Go to the [home page](https://github.com/apigee/docs-sandbox) to clone the repo.
2. Locate or create the Edge organization to which you'll deploy StreetCarts proxies.

 This can be any of your organizations. Find out more about [creating an account](http://docs.apigee.com/api-services/content/creating-apigee-edge-account) in the documentation.
 
3. Find or create the API BaaS application in which you'll create StreetCarts data.

 This application should be empty because StreetCarts requires (and will create) specific permissions settings. See the API BaaS docs for more on [creating a new application](http://docs.apigee.com/app-services/content/creating-new-application-admin-console).
  
4. [Deploy the proxies](#deploy).
5. [Configure the data store](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/proxies/src/gateway/data-manager).

 Add user groups, roles, and permissions that make it possible to start adding food carts with the API.

6. [Configure Edge](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/proxies/src/gateway#vault).

 Set up a vault in the secure store, along with three entries that will be used to store API BaaS client app credentials. Edge will use these to authenticate for creating BaaS permissions.
 
<a name="deploy" />
## Deploy the proxies

Follow these instructions to set up StreetCarts on Edge. 

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

## Using Postman to make API calls

Steve Traut created Postman environments and collections. The are located [here](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/test/postman). Download the most recent environment and collection. Then edit your environment with the keys, org, etc for your setup. 

## Quick test

Grab the consumer key from StreetCarts' SC-APP-TRIAL or SC-APP-UNLIMITED developer app. Use the consumer key as an API to make a call that doesn't require an OAuth token, such as this GET call:

`curl http://<your_org>-test.apigee.net/v1/streetcarts/foodcarts -H 'x-api-key: <your api key>'`


## Using OAuth

Some of the proxies require an OAuth token. Using the Postman collection, you get tokens like this:

1. Call the `Register user` API. This API creates a new user with a username and password.
2. Call the `Authenticate user` API to generate an access token. 
    1. Set the Basic Auth with username/password as the client key/secret for one of the provisioned developer apps.
    2. Be sure to pass the scope header. Scopes set what the user can do. 

    If the user is a cart owner, pass these scopes:

    `owner.create owner.update owner.read owner.delete`

    If the user is a cart manager, pass these scopes:

    `manager.update manager.read`







