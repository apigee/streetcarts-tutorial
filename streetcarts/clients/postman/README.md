# StreetCarts Postman Client

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
3. In the **Import** dialog, choose the .postman_environment file corresponding to the .postman_collection file, then click Open.
4. Close the **Import** dialog.



