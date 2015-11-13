 var target = context.getVariable("target.url");
 var suffix = context.getVariable("proxy.pathsuffix");

 print("target.url: " + target)
 print("proxy.pathsuffix: " + suffix);
 
 var targetRewrite = target + "/carts" + suffix;
 print("target.rewrite: " + targetRewrite);
 context.setVariable("target.url", targetRewrite);