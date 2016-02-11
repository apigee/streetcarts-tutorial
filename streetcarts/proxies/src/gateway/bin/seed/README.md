# StreetCarts Initial Configuration and Seed Data

Use the files in this directory to configure a new StreetCarts deployment, then seed it with data. You can use the scripts in this directory to:

* Add a vault and vault entries to the Edge environment to which StreetCarts is deployed. StreetCarts uses these entries to hold values it uses to authenticate with API BaaS for some requests.
* Add user groups, roles, and permissions to the API BaaS application that will hold StreetCarts data. These are needed to provide initial role-based security.
* Seed the API BaaS application that StreetCarts will use with user and foodcart data.

This directory includes the following:

| File | Description |
| --- | --- |
| apigee-app-config.js | Node script with general utility functions for configuring Edge and BaaS. |
| /data | JSON files with seed data. |
| package.json | List of Node modules required by these tools. |
| README.md | This file. |
| streetcarts-config-seed.js | Node script with functions to configure Edge and Baas for StreetCarts, and to seed API BaaS with StreetCarts data. |
| streetcarts-config.json | Key/value pairs describing the Edge and BaaS applications. |

## Prerequisites

Use the tools here *after* you have deployed StreetCarts to an Edge organization and environment (for more, see ---), and *after* you have created an API BaaS application to hold your data.

You run the scripts here using Node.js, so you'll need to have:
* Node.js.
* Node modules required by these scripts. You can install these by running `npm install` in the `seed` directory. 

## Configuring Edge and API BaaS for StreetCarts

1. After you've deployed StreetCarts to an Edge organization/environment, **edit bootstrap-config.json**, replacing placeholders with values from your own Edge and API BaaS configuration. This is a one-time task you'd do for each deployment.

 Replace the following keys:

 | Key | Description |
 | --- | --- |
 | mgmtApiHost | Host for access to Edge management API, such as `api.enterprise.apigee.com` |
 | appApiHost | Host for access to StreetCarts API, such as `apigee.net` |
 | orgName | Name of the Edge app where StreetCarts is deployed |
 | envName | Name of the Edge environment where StreetCarts is deployed, such as `prod` OR `test` |
 | consumerKey (for SC-PUBLIC-APP) | Consumer key from Streets dev app SC-PUBLIC-APP |
 | consumerKey (for SC-OWNER-APP) | Consumer key from Streets dev app SC-OWNER-APP |
 | consumerSecret (for SC-OWNER-APP) | Consumer secret from Streets dev app SC-OWNER-APP |
 | datastore-client-id | Client ID from API BaaS org where StreetCarts data will be hosted. |
 | datastore-client-secret | Client secret from API BaaS org where StreetCarts data will be hosted. |
 | API BaaS orgName | Name of the API BaaS org where StreetCarts data will be hosted. |
 | API BaaS appName | Name of the API BaaS app where StreetCarts data will be hosted. |
 | API BaaS apiHost | Host for access to the API BaaS API, such as `api.usergrid.com` |
 | API BaaS clientId | Client ID from the API BaaS org where StreetCarts data will be hosted.  |
 | API BaaS clientSecret | Client secret from the API BaaS org where StreetCarts data will be hosted. |

2. **Add the vault and vault entries** StreetCarts will need for some requests to API BaaS by running the following command in the `seed` directory. This script uses the Edge management API, so requires your Edge credentials.

 ```
node streetcarts-bootstrap configure-edge /path/to/streetcarts-config.json <edge-account-email-or-username> <edge-password>
```
2. **Add user groups, roles, and permissions** StreetCarts will need for role-based security by running the following command in the `seed` directory. This script uses the API BaaS API and authenticates with the client ID and secret in streetcarts-config.json.

 ```
node streetcarts-bootstrap configure-baas /path/to/streetcarts-config.json
```

## Seeding API BaaS with StreetCarts data

After you've configured Edge and API BaaS as described above, you can seed the API BaaS data store with StreetCarts data. StreetCarts seed data includes user data, data about five foodcarts, a menu for each, and a few items for each. 

The script uses the StreetCarts API to add the data. Using the script, you'll add user data first with an API for registering users. Once user data is in the system, you'll add foodcart data with a script that authenticates as a user, then adds the foodcart, menus, and items. The foodcart data in `combined-seed-data.json` includes all the foodcart, menu, and item data for convenience (associating menus and items with the correct foodcart). To import data separately (such as with the API BaaS UI), use the other JSON seed files.

1. **Add user data** by running the following with the users.json file in the `data` directory.

 ```
node streetcarts-bootstrap register-users /path/to/users.json
```

2. **Add foodcart data** by running the following with the combined-seed-data.json and users.json files in the `data` directory. 

 ```
node streetcarts-bootstrap create-foodcarts /path/to/combined-seed-data.json /path/to/users.json
```
