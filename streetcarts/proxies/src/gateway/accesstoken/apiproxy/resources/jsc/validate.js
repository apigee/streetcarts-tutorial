 //-- TODO see this article: https://community.apigee.com/articles/2340/asynchronous-http-requests-in-an-api-proxy.html
 
 //-- Get credentials. 
 
 var username = context.getVariable("request.formparam.username");
 var password = context.getVariable("request.formparam.password");
 
 //-- Assemble the request to the Data Manager.
 
 var bodyObj = {
    'username': username,
    'password': password
  };
  

  dmurl = "https://PROXYHOSTREPLACE/v1/streetcarts/data-manager/authenticate";
  
  var bodyStr = JSON.stringify(bodyObj);
  var dmKey = context.getVariable("DATA-MANAGER-KEY");
  print("DMKEY: " + dmKey);
 

  var headers = {'Content-Type' : 'application/json', 'x-api-key': dmKey};

  //-- Call the data manager.
  var myRequest = new Request(dmurl,"POST",headers, JSON.stringify(bodyObj));
  var exchange = httpClient.send(myRequest);

  exchange.waitForComplete();

  if (exchange.isSuccess()) {
    var responseObj = exchange.getResponse().content.asJSON;

    if (responseObj.statusCode && responseObj.statusCode == 400){
        context.setVariable("streetcarts.user.valid", "false");
    } else if (responseObj.access_token) {
        
        var userId = responseObj.user.uuid;
        var userBaaSToken = responseObj.access_token;
        context.setVariable("streetcarts.user.valid", "true");
        context.setVariable("streetcarts.user.id", userId);
        context.setVariable("streetcarts.user.baas.token", userBaaSToken);
        print("baas token: " + userBaaSToken);
        
    } else {
        context.setVariable("streetcarts.user.valid", "false");
    }
  }