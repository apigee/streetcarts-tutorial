# StreetCarts Postman client

This directory contains collection and environment files to make it easier to set up a client to StreetCarts. 

You can think of the files here as representing two kinds of Postman clients -- one for sequentially testing calls in the collection list, and the other for testing calls independently

| Client | Files | Description |
| --- | --- | --- |
| Scripted | StreetCartsEnvironment-scripted.postman_collection, StreetCartsEnvironment-scripted.postman_environment | Pre-request and test scripts make it easier to use the calls in a sequence. For example, a successful "Create user" call will populate selectedUsername, selectedUserPassword, and selectedUserUUID variables that are used by the next call in the list, "Authenticate user".|
| Simple | StreetCartsCollection-noscript.postman_collection, StreetCartsEnvironment-noscript.postman_environment | Use this collection and environment to set up a simple client for making non-sequential calls. You'll need to replace variable names in URLs with your own values (usually UUIDS).|  

In [Postman](https://www.getpostman.com/), import the collection and environment here for a set of 

## Setting up the client

1. In Postman, click **Import**.
2. In the **Import** dialog, choose the .postman_collection file for the type of client you want to use, then click Open.
3. In the **Import** dialog, choose the .postman_environment file corresponding to the .postman_collection file, then click **Open**.
4. Close the **Import** dialog.
5. In the environments dropdown, click **Manage Environments**.
6. In the **Manage Environments** dialog, click the name of the environment you imported, then enter values for the following variables:

 | Variable | Value | 
| --- | --- |
| ORG | Name of the Edge organization you're using for StreetCarts |
| ENV | Name of the Edge environment to which you've deployed StreetCarts, such as `test` |
| DOMAIN | Name of the domain hosting StreetCarts, such as `apigee.net` |
| API-KEY | The Edge consumer key value from either the SC-APP-TRIAL or SC-APP-UNLIMITED developer app |
| ACCESS-TOKEN | The access token for an authenticated user. In the script environment, this value is populated automatically when you run the "Authenticate user" API call |
7. For the "Authenticate user" endpoint, add credentials needed to request and OAuth token.
 1. In the collection, click the Authenticate user call to edit it.
 2. Click the Authorization tab, then enter the following values from either the SC-APP-TRIAL or SC-APP-UNLIMITED developer apps in your StreetCarts deployment on Edge:
  For Username, enter the consumer key.
  For Password, enter the consumer secret.

## Using the noscript collection and environment

If you imported the -noscript collection and environment, replace placeholders in URLs to make valid calls.

## Using the script collection and environment

If you imported the -script collection and environment, you should be able to make calls from top to bottom without having to type in variable values for each. Those values are set by script, generally JavaScript in the request's Tests tab.

The following variables are included in the script environment.

| Variable | Value | 
| --- | --- |
| selectedCartUUID | UUID of a food cart in the data store. Set automatically when you GET a food cart with the script collection. |
| selectedMenuUUID | UUID of a menu in the data store. Set automatically when you GET a menu with the script collection. |
| selectedUsername | username of a user in the data store. Set automatically when you register a user with the script collection. |
| selectedUserPassword | password of a user in the data store. Set automatically when you register a user with the script collection. |
| selectedUserUUID | UUID of a user in the data store. Set automatically when you register a user with the script collection. |
| selectedUserPassword | password of a user in the data store. Set automatically when you register a user with the script collection. |
| newCartUUID | UUID of a food cart in the data store. Set automatically when you create a food cart with the script collection. |
| newMenuUUID | UUID of a menu in the data store. Set automatically when you create a menu with the script collection. |
| newItemUUID | UUID of an item in the data store. Set automatically when you create a menu with the script collection. |



