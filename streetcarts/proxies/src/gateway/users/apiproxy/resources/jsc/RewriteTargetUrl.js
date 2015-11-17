 var target = context.getVariable("target.url");
 var suffix = context.getVariable("proxy.pathsuffix");
 var dmKey = context.getVariable("DATA-MANAGER-KEY");
 
 context.setVariable("request.header.x-api-key", dmKey);
 var targetRewrite = target + "/users" + suffix;
 context.setVariable("target.url", targetRewrite);
