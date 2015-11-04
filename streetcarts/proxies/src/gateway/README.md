# StreetCarts API Maven build

We can auto-deploy the latest versions of our StreetCarts proxies using Maven. This setup is based on the Apigee Maven plugin: https://github.com/apigee/apigee-deploy-maven-plugin.

### Download and install Maven

1. Make sure you have Java 1.7 or later. Type ```java -version``` in the terminal to find out your version. Upgrade to the latest version of Java if needed.
2. [Download and install Maven 3.x](http://maven.apache.org/download.cgi)
   
   Then add Maven to your ~/.bash_profile so that the ```mvn``` command is recognized. For example, in ~/.bash_profile, add: 
   
   ```export PATH=/Users/ApigeeCorporation/development/apache-maven-3.3.3/bin:$PATH```

   pointing to wherever you've stashed Maven.

### Get the latest API proxy updates

To get the latest version of the API proxies, cd to this project's parent directory and do a ```git pull https://github.com/apigee/docs-sandbox```, or do a sync in your Git client.


### Modify files for test deployment

1. Point the build to the correct org and server.
   In /streetcarts/proxies/src/gateway/shared-pom.xml, scroll to the <profiles> section and modify the following in the ```test``` and ```prod``` groups:
   - ```<org>``` - Change this to the org you want to deploy to.
   - ```<apigee.hosturl>``` - For the public cloud, change this to https://api.enterprise.apigee.com so that it's not pointing at e2e.

### Run the script

cd to /streetcarts/proxies/src/gateway and run the shell script: ```./streetcarts_build.sh```

In the Edge UI, check your org to make sure the proxies were deployed.

### Problems?

Ask your colleagues at docs@apigee.com.


