# StreetCarts API Proxy

### Set up and deploy the API

Following are instructions for setting up and deploying the StreetCarts app to Edge. Scripts are provided to make things easy to manage. 


#### About the scripts

The main script `main.sh` provisions products, developer apps, and a developer to your Edge organization. You should only need to do this once, and after that, only if you edit any of these entity files. The script also prompts you to run the `invoke.sh` script, which tests your APIs. You can always run `invoke.sh` by calling it directly. As you develop your APIs, you'll call `invoke.sh` many many times.

The `invoke.sh` script makes a bunch of API calls to streetcarts. Please try to keep the file up to date as you add proxy flows. That is, if you add a proxy flow (e.g., add an item to a cart), then add a call to the API in `invoke.sh`.

#### Set up and provision

1. Clone the docs-sandbox .
2. `cd` to `docs-sandbox/apps/streetcarts/bin`
3. Do `chmod 755 *.sh`
4. Open `setenv.sh` in an editor and add your Apigee Edge org information to it. 

    Like this:
    ```
       org="docs" //  your org name
       username="wwitman@apigee.com"  // your apigee email address
       url="https://api.enterprise.apigee.com"  // don't edit
       env="test"  // your environment
       api_domain="apigee.net" // don't edit
    ```

5. Save the file.
4. Execute: `./main.sh`
5. Respond to the prompts as follows:

   1. `Do you want to cleanup entities? ([y]/n):`

       Say "y" if you want to remove the products, developers, and developer apps that this script creates. I usually say "y" to this. It's probably a good idea to always select this. It doesn't hurt. But you only have to do it if you changed one of the entities and want to recreate them. 

   2. `Do you want to add entities? ([y]/n):`

       Say "y" if you are running this script for the first time, or if you have run the cleanup. It creates products, developers, and developer apps that are used by the proxy for testing. 

   3. `Do you want to invoke? ([y]/n):`

       Say "y" to run the tests. 


#### Deploy using Maven

We are using the Maven plugin to deploy StreetCarts to Edge. To set things up, follow this [README](https://github.com/apigee/docs-sandbox/tree/master/apps/streetcarts/proxies/src/gateway). 

**Tip:** Because the main Maven build script takes a long time to run, it's handy to hack `build_streetcarts.sh` into separate scripts, one for each of the proxies. For example, `build_users.sh`, `build_data_manager.sh`, and so on.

#### Developing proxies

There are a lot of API paths to implement in StreetCarts. For example, there has to be an API to "add an item to a menu" or "update a menu item". Where to start?

1. Come up with a use case that you'd like to implement. 
2. Check in `invoke.sh` to see if it's already implemented. If it is, there should be a test for it. 
3. Take some time to examine one of the existing APIs. The APIs for adding an item to a menu or updating an item are both good examples. 
4. Open the `default.xml` file for the Target Endpoint, and notice that the TargetConnection points to the data-manager proxy. 

    **Important:** You need to edit the URL to match your org-name and environment. You have to be sure to set the target URL in each proxy in your org. 

4. In the Edge UI, open the proxy you need to work in. For example, the menus proxy has most (but not all) of the menu-related APIs. 
5. Find the API that you want implement -- most of the APIs were stubbed in, so you should be able to find what you need.
6. Think about if the API needs an OAuth token or if just an API key will do. Most of the APIs that let you edit things require a token. The public APIs just need a key.
7. Edit the Flow as shown below. You have to add SetRestrictedResource and ValidateToken first. Then, be sure the Condition property is set up correctly. The Condition below is set up to match paths like /menus/{menuid}. Remember that all the proxies contain the proxy name in the basepath, so you don't have to add that to the Condition. 

     ```
          <Flow name="Update Menu Item">
                <Description>Update Menu Item</Description>
                <Request>
                    <Step>
                        <Name>SetRestrictedResource</Name>
                    </Step>
                    <Step>
                        <Name>ValidateToken</Name>
                    </Step>
                </Request>
                <Response/>
                <Condition>(proxy.pathsuffix MatchesPath "/*") and (request.verb = "PUT")</Condition>
            </Flow>
     ```

8. Save the proxy.
9. Open the product called `SC-OWNER-PRODUCT`, and follow the pattern to add your proxy to the product. You'll need to add something like `/PUT/v1/streetcarts/menus`. This is the path that Edge checks to make sure the token is valid. It is set in the proxy flow by the SetRestrictedResource JavaScript policy. 
10. Add your API to the `invoke.sh` script.
11. A lot of the time, some debugging is required. 
11. Call `invoke.sh` as many times as it takes to get the API debugged and working properly. 

#### Keeping things in sync

The proxies are XML files, and they exist in two places -- the ones that are deployed to Edge and the ones on your file system. 

Maven does a good job of deploying from your local system to Edge. However, you'll quickly find that you're tweaking things in the Edge UI as you're debugging or trying things out. When you do this, it's very easy to forget to copy your changes back to your local files. If you don't copy the changes down, the next time you deploy they will be lost. 

We need to find a better way to handle keeping things in sync, because this manual copying is a pain. 

