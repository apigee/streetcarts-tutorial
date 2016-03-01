# Seed data for StreetCarts

This directory contains data and scripts for configuring and seeding the StreetCarts.

<a name="configure" />
## Configuring StreetCarts

To set up integration between the StreetCarts proxies and the API BaaS backend data store, you'll need to configure a couple of things. You'll need to:

* **Add a vault and vault entries** to the Edge environment. StreetCarts uses these entries to hold values for authenticating with API BaaS.
* **Add user groups, roles, and permissions** to API BaaS. These are needed to provide initial role-based security.

### Prerequisites

Before you configure the app, you should have first:

* Deployed StreetCarts to an Edge organization and environment.
* Created an API BaaS application to hold your data.
* Installed Node.js.
* Installed Node modules required by these scripts. You can install these by running `npm install` in the `streetcarts/proxies/src/gateway/bin/seed` directory. 

### Set configuration options

The configuration scripts read a config file at `streetcarts/proxies/src/gateway/bin/seed/bootstrap-config.json` for information about the application. Edit this file, replacing the placeholder values the keys described in the following table:

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

<a name="vault" />
### Configure a streetcarts vault

StreetCarts uses [application client](http://docs.apigee.com/app-services/content/user-authentication-types#adminauthenticationlevels) credentials to make permissions changes in API BaaS. It stores these credentials in the secure Edge vault because they grant full access to the API BaaS data store.

Before running StreetCarts, you'll need to set up an Edge vault and vault entries for these credentials. You can do this either with the included script or by using the Edge management API manually.

#### Adding a vault with the config script

2. **Add the vault and vault entries** StreetCarts will need for some requests to API BaaS by running the following command in the `seed` directory. This script uses the Edge management API, so requires your Edge credentials.

 > Note: This is an alternative to the manual process (described below) using the Edge management API.

 ```
node streetcarts-config-seed configure-edge /path/to/streetcarts-config.json
```

#### Adding a vault with the management API

1. Go to the API BaaS admin console and note the client ID and client secret for the application's organization. These should be on the Org Administration page.
2. Use the Edge management API to [add a vault](http://docs.apigee.com/management/apis/post/organizations/%7Borg_name%7D/environments/%7Benv_name%7D/vaults) and [add vault entries](http://docs.apigee.com/management/apis/post/organizations/%7Borg_name%7D/environments/%7Benv_name%7D/vaults/%7Bvault_name_in_env%7D/entries), as listed in the following table:

 | Vault Name | Scope | Entry | Value |
 | --- | --- | --- | --- | --- |
 | streetcarts | environment | datastore-client-id | \<API BaaS client ID> |
 | streetcarts | environment | datastore-client-secret | \<API BaaS client secret> |
 | streetcarts | environment | datastore-client-token | None. |
 
 For example, to create a vault called "streetcarts" in the test environment of myorg, you could use the following endpoint and JSON body:
 
 Endpoint: `POST https://api.enterprise.apigee.com/v1/organizations/myorg/environments/test/vaults`
 
 
 Body: `{"name":"streetcarts"}`

### Configure API BaaS with user groups, roles, and permissions

In addition to using API BaaS as a data store, StreetCarts uses it to authorize user requests. using user groups, roles, and permissions to manage access. So before running StreetCarts, you'll need to make a few general permissions settings (the data-manager configures specific permissions for foodcarts as you use the API). These changes will add support for adding new data with the API.

You can configure API BaaS either by [using the scripts provided in this repo](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/proxies/src/gateway/bin/seed), or by making the settings in the API BaaS admin console, as described below.

#### Configuring API BaaS with the script

Add user groups, roles, and permissions StreetCarts will need for role-based security by running the following command in the `seed` directory. This script uses the API BaaS API and authenticates with the client ID and secret in streetcarts-config.json.

> Note: This is an alternative to the manual process (described below) using the API BaaS admin console.

 ```
node streetcarts-config-seed configure-baas /path/to/streetcarts-config.json
```

<a name="add-data" />
## Add data to StreetCarts

After you've configured Edge and API BaaS as described above, you can try out the API you've set up. You can do this by adding data one call at a time or by seeding the data store with a batch script.

<a name="seed" />
### Seeding the data store with a batch script

You can use the included Node.js scripts to add several food carts, food items, and menus to the data store at once. The script uses the StreetCarts API to add the data.

> The data in `combined-seed-data.json` includes all the foodcart, menu, and item data for convenience (associating menus and items with the correct foodcart). To import data separately (such as with the API BaaS UI), use the other JSON seed files.

1. In a console window, cd to `/streetcarts/proxies/src/gateway/bin/seed`.

1. **Add user data** by running the following with the users.json file in the `data` directory.

 ```
node streetcarts-config-seed register-users ./streetcarts-config.json ./data/users.json
```

2. **Add foodcart data** by running the following with the combined-seed-data.json and users.json files in the `data` directory. 

 ```
node streetcarts-config-seed create-foodcarts ./streetcarts-config.json ./data/combined-seed-data.json ./data/users.json
```

