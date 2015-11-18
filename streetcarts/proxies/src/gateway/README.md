# StreetCarts API Maven build

We can auto-deploy the latest versions of our StreetCarts proxies using Maven. This setup is based on the Apigee Maven plugin: https://github.com/apigee/apigee-deploy-maven-plugin.

### Download and install software

1. Make sure you have Java 1.7 or later. Type ```java -version``` in the terminal to find out your version. Upgrade to the latest version of Java if needed.
2. [Download and install Maven 3.x](http://maven.apache.org/download.cgi)
   
   Then add Maven to your ~/.bash_profile so that the ```mvn``` command is recognized. For example, in ~/.bash_profile, add: 
   
   ```export PATH=/Users/ApigeeCorporation/development/apache-maven-3.3.3/bin:$PATH```

   pointing to wherever you've stashed Maven.
3. Make sure you have the ```git``` command-line tool installed. In a terminal window, run ```which git```. If no path is returned, you need to install it.

### Git the latest API proxy updates

The script does an automatic pull to get the latest from the repo. Your local changes should remain intact.

If git prompts you for credentials, you can configure it to either use SSH or set up a credential keychain. For info and troubleshooting, see the following topics:
- https://help.github.com/articles/caching-your-github-password-in-git/
- http://olivierlacan.com/posts/why-is-git-https-not-working-on-github/


### Run the script

1. cd to /streetcarts/proxies/src/gateway

2. Run the shell script: ```./streetcarts_build.sh```

You will be prompted to enter your Edge email, password, org name, and deployment environment. The deployment environment is typically either the Edge Cloud, https://api.enterprise.apigee.com, or the Edge e2e server:  https://api.e2e.apigee.net. 

If you want to pass all that on the command line:

# ./streetcarts_build.sh  -u sfoo@apigee.com -p PWORD -o myorg -e https://api.enterprise.apigee.com

Use the -h option for help:

# ./streetcarts_build.sh  -h

In the Edge UI, check your org to make sure the proxies were deployed.

### Ensure you have the required Node.js plugins

If this is the first time that you have uploaded the proxies, you have to ensure that you have all of the required Node.js plugins used by the data-manager API proxy.

1. After running maven to deploy this proxy, call [this Edge API](http://apigee.com/docs/management/apis/post/organizations/%7Borg_name%7D/apis/%7Bapi_name%7D/revisions/%7Brevision_num%7D/npm-0) to run npm install on Edge. This is the API called "Manage Node Packaged Modules" under the SmartDocs->API Proxies menu. 

   - Ensure that you specify "data-manager" as the name of the API proxy.
   - Ensure that you set the Request Body to: command=install   

   Note: Be sure to specify the correct revision for your deployed instance of data-manager.

2. Undeploy and then redeploy the data-manager proxy in the Edge UI. 


### Problems?

Ask your colleagues at docs@apigee.com.


