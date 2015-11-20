 //-- TODO see this article: https://community.apigee.com/articles/2340/asynchronous-http-requests-in-an-api-proxy.html
 
 //-- Get credentials. 
 
 var username = context.getVariable("request.formparam.username");
 var password = context.getVariable("request.formparam.password");
 
 //-- Assemble the request to the Data Manager.
 
 var bodyObj = {
    'username': username,
    'password': password
  };
  
  var bodyStr = JSON.stringify(bodyObj);
  var dmurl = "http://wwitman-test.apigee.net/v1/streetcarts/data-manager/authenticate";
  var headers = {'Content-Type' : 'application/json', 'x-api-key': 'nFES3HWNLTOnfv6Ga6AqPtbe86NA48wJ'};

  //-- Call the data manager.
  var myRequest = new Request(dmurl,"POST",headers, JSON.stringify(bodyObj));
  var exchange = httpClient.send(myRequest);

  exchange.waitForComplete();

  if (exchange.isSuccess()) {
    var responseObj = exchange.getResponse().content.asJSON;
    var statusCode = responseObj.statusCode;
    print("CODE: " + statusCode);
    if (statusCode == "200") {
        print("USER VALID");
        //TODO --- Steve needs to return this in the response or entire user.  
        var ownerId = "4ab08a6a-6d16-11e5-817d-a9b5da1cd192"; 
        context.setVariable("streetcarts.user.valid", "true");
        context.setVariable("streetcarts.user.id", ownerId);
     }
     else {
        context.setVariable("streetcarts.user.valid", "false");
     }
  }