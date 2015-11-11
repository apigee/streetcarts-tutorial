1. Before running Maven to deploy the data-manager proxy, remove the `node_modules` directory if it's present in data-manager/apiproxy/resources/node. 

2. After running maven to deploy this proxy, call [this Edge API](http://apigee.com/docs/management/apis/post/organizations/%7Borg_name%7D/apis/%7Bapi_name%7D/revisions/%7Brevision_num%7D/npm-0) to run npm install on Edge. This is the API called "Manage Node Packaged Modules" under the SmartDocs->API Proxies menu. 

Note: Be sure to secify the correct revision for your deployed instance of data-manager.

3. Redeploy the data-manager proxy in the Edge UI. 

