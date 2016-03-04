# StreetCarts API application

StreetCarts is a full API application that integrates Apigee Edge with API BaaS to provide data about mobile food carts.

> For information about deploying StreetCarts, see the [Deploying and Running StreetCarts](https://github.com/apigee/docs-sandbox/wiki/Deploying-and-Running-StreetCarts) in the repository wiki.

StreetCarts illustrates the following:

* Multiple client-facing proxies calling a single internal proxy to share a connection with a backend resource.
* Authentication with Edge OAuth policies.
* Authorization with API BaaS user groups, roles, and permissions.
* Enforcing two distinct client access levels with the Quota policy.
* Suppressing traffic spikes with the Spike Arrest policy.
* Node.js modules to integrate an API BaaS data store with Edge proxies.
* Storing sensitive credential data in the Edge secure store (vault).

![StreetCarts diagram](https://github.com/apigee/docs-sandbox/blob/master/apps/streetcarts/streetcarts-diagram.png).

## Install the app

For steps describing how to get StreetCarts installed and usable (with data), see [Deploying and Running StreetCarts](https://github.com/apigee/docs-sandbox/wiki/Deploying-and-Running-StreetCarts).

## Learn more about what's in it

StreetCarts integrates a set of Edge API proxies with an API BaaS data store.

* For more about the proxies, see [StreetCarts API proxies](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/proxies/src/gateway).
* For an explanation of how StreetCarts accesses the data store, see [StreetCarts data manager](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/proxies/src/gateway/data-manager).


