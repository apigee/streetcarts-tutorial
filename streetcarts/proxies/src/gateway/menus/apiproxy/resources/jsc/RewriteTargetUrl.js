 var target = context.getVariable("target.url");
 var suffix = context.getVariable("proxy.pathsuffix");

 print("target.url: " + target)
 print("proxy.pathsuffix: " + suffix);
print("KEY: " + context.getVariable("DATA-MANAGER-KEY"));
 
 context.setVariable("request.header.x-api-key", "nFES3HWNLTOnfv6Ga6AqPtbe86NA48wJ");
 var targetRewrite = target + "/menus" + suffix;
 print("target.rewrite: " + targetRewrite);
 context.setVariable("target.url", targetRewrite);
