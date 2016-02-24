# StreetCarts API Maven build

We can auto-deploy the latest versions of our StreetCarts proxies using Maven. This setup is based on the Apigee Maven plugin: https://github.com/apigee/apigee-deploy-maven-plugin.

[Download and install software](#download)

[Git the latest API proxy updates](#updates)

[Run the script](#runscript)

[Ensure you have the required Node.js plugins](#plugins)

[Check HTTPTargetConnection in TargetEndpoints](#httptargetconnection)

[Configure the streetcarts vault](#vault)

[Problems?](#problems)

<a name="download" />
## Download and install software

1. Make sure you have Java 1.7 or later. Type ```java -version``` in the terminal to find out your version. Upgrade to the latest version of Java if needed.
2. [Download and install Maven 3.x](http://maven.apache.org/download.cgi)
   
   Then add Maven to your ~/.bash_profile so that the ```mvn``` command is recognized. For example, in ~/.bash_profile, add: 
   
   ```bash
   export PATH=/Users/ApigeeCorporation/development/apache-maven-3.3.3/bin:$PATH
   ```

   pointing to wherever you've stashed Maven.

3. Make sure you have the ```git``` command-line tool installed. In a terminal window, run ```which git```. If no path is returned, you need to install it.

<a name="updates" />
## Git the latest API proxy updates

The script does an automatic pull to get the latest from the repo. Your local changes should remain intact.

If git prompts you for credentials, you can configure it to either use SSH or set up a credential keychain. For info and troubleshooting, see the following topics:

* https://help.github.com/articles/caching-your-github-password-in-git/
* http://olivierlacan.com/posts/why-is-git-https-not-working-on-github/

<a name="runscript" />
## Run the script

1. cd to /streetcarts/proxies/src/gateway/bin

2. Run the shell script: ```./main.sh```

   You will be prompted to enter your Edge email, password, org name, and deployment environment. The deployment environment is typically either the Edge Cloud, https://api.enterprise.apigee.com, or the Edge e2e server: https://api.e2e.apigee.net. 

   If you want to pass options on the command line:

   ```bash
   ./main.sh  -u sfoo@apigee.com -p PWORD -o myorg -e https://api.enterprise.apigee.com
   ```

   Use the -h option for help:

   ```bash
   ./main.sh  -h
   ```

In the Edge UI, check your org to make sure the proxies were deployed.

### Sample API products, developer, and apps

The script also asks you if you want to create sample API products, developer, and apps, which allow you to successfully run the StreetCarts API proxies. 

<a name="plugins" />
## Ensure you have the required Node.js plugins

**Note: The ```main.sh``` script does the following automatically.**

If this is the first time that you have uploaded the proxies, you have to ensure that you have all of the required Node.js plugins used by the data-manager API proxy.

1. After running maven to deploy this proxy, call [this Edge API](http://apigee.com/docs/management/apis/post/organizations/%7Borg_name%7D/apis/%7Bapi_name%7D/revisions/%7Brevision_num%7D/npm-0) to run npm install on Edge. This is the API called "Manage Node Packaged Modules" under the SmartDocs->API Proxies menu. 

   - Ensure that you specify "data-manager" as the name of the API proxy.
   - Ensure that you set the Request Body to: command=install   

   Note: Be sure to specify the correct revision for your deployed instance of data-manager.

   OR, use the following cURL. For e2e, change the URL host to https://api.e2e.apigee.net.

   ```curl -X POST --header "Content-Type: application/x-www-form-urlencoded" -u {you@apigee.com} -d "command=install" "https://api.enterprise.apigee.com/v1/organizations/{org}/apis/data-manager/revisions/{version_num}/npm"
   ```

2. Undeploy and then redeploy the data-manager proxy in the Edge UI. 

<a name="httptargetconnection" />
## Check HTTPTargetConnection in TargetEndpoints

In all proxies *other than* ```accesstoken``` and ```data-manager```:

1. In the proxy editor Navigator, click **default** under Target Endpoints.

2. In the editor pane, scroll to the bottom of the file and make sure the HTTPTargetConnection URL base path is correct. (For example, if you're an Apigeek deploying in the internal e2e environment, the base URL should be accurate for calling the proxies in your environment. For example, https://{org}-{env}.apigee.net). 

<a name="vault" />
## Configure a streetcarts vault

StreetCarts uses [application client](http://docs.apigee.com/app-services/content/user-authentication-types#adminauthenticationlevels) credentials to make permissions changes in API BaaS. It stores these credentials in the secure Edge vault because they grant full access to the API BaaS data store.

Before running StreetCarts, you'll need to set up an Edge vault and vault entries for these credentials.

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

<a name="problems" />
## Problems?

Ask your colleagues at docs@apigee.com.


