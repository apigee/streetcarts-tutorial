# StreetCarts API Proxies

StreetCarts is a full API application that integrates Apigee Edge with API BaaS to provide data about mobile food carts.

> For information about deploying StreetCarts, see the [Deploying and Running StreetCarts](https://github.com/apigee/docs-sandbox/wiki/Deploying-and-Running-StreetCarts) in the repository wiki.

StreetCarts illustrates the following:

* Multiple client-facing proxies calling a single internal proxy to share a connection with a backend resource.
* Storing sensitive credential data in the Edge secure store (vault).
* Node.js modules to integrate an API BaaS data store with Edge proxies.
* Authentication with Edge OAuth policies.
* Authorization with API BaaS user groups, roles, and permissions.
* Enforcing two distinct client access levels with the Quota policy.
* Suppressing traffic spikes with the Spike Arrest policy.

![StreetCarts diagram](https://github.com/apigee/docs-sandbox/blob/master/apps/streetcarts/streetcarts-diagram.png).
