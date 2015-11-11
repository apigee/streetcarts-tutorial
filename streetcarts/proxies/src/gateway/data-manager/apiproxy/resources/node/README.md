Before running Maven to deploy the data-manager proxy, remove the `node_modules` directory. 

After running maven to deploy this proxy, call [this Edge API](http://apigee.com/docs/management/apis/post/organizations/%7Borg_name%7D/apis/%7Bapi_name%7D/revisions/%7Brevision_num%7D/npm-0) to run npm install on Edge. This is the API called "Manage Node Packaged Modules" under the SmartDocs->API Proxies menu. 

Be sure to secify the correct revision for your deployed instance of data-manager.

