// This code executes before the proxy makes a calls to 
// the API BaaS data store. 

// Completes the URL to the API BaaS target. 
var target = context.getVariable("target.url");
var suffix = context.getVariable("proxy.pathsuffix");
var targetRewrite = target + "/foodcarts" + suffix;
context.setVariable("target.url", targetRewrite);

// Gets the API key for the data manager proxy and 
// puts it into a variable for use when authenticating
// with the data manager.
var dmKey = context.getVariable("DATA-MANAGER-KEY");
context.setVariable("request.header.x-api-key", dmKey);

// Gets the user ID from the OAuth access token and puts 
// it into a variable for use later
var userId = context.getVariable('accesstoken.USER_UUID');
context.setVariable("request.header.x-user-uuid", userId);

// Gets the access token sent back from API BaaS during user
// authentication and puts the token into a variable. The 
// token will be used for most POST/PUT/DELETE calls to BaaS.
var userBaaSToken = context.getVariable('accesstoken.USER_BAAS_TOKEN');
context.setVariable("request.header.x-user-baas-token", userBaaSToken);
