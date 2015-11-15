  var target = context.getVariable("target.url");
 var suffix = context.getVariable("proxy.pathsuffix");

 print("target.url: " + target)
 print("proxy.pathsuffix: " + suffix);
 
 var targetRewrite = target + "/users" + suffix + "?apikey=JBjbg7SL1dHfRJPE3AuFUewGS6k9LTgD";
 print("target.rewrite: " + targetRewrite);
 context.setVariable("target.url", targetRewrite);