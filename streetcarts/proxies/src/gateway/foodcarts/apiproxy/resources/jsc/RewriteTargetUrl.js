 var target = context.getVariable("target.url");
 var suffix = context.getVariable("proxy.pathsuffix");
 var dmKey = context.getVariable("DATA-MANAGER-KEY");
 var userId = context.getVariable('accesstoken.USER_UUID');
 print("KEY: " + dmKey);
 
 context.setVariable("request.header.x-user-uuid", userId);
 context.setVariable("request.header.x-api-key", dmKey);
 var targetRewrite = target + "/foodcarts" + suffix;
 context.setVariable("target.url", targetRewrite);
