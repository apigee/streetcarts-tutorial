 var target = context.getVariable("target.url");
 var suffix = context.getVariable("proxy.pathsuffix");
 var dmKey = context.getVariable("DATA-MANAGER-KEY");
 print("KEY: " + dmKey);
 
 context.setVariable("request.header.x-api-key", dmKey);
 var targetRewrite = target + "/foodcarts" + suffix;
 context.setVariable("target.url", targetRewrite);
