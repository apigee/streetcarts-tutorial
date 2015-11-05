 var target = context.getVariable("target.url");
 var suffix = context.getVariable("proxy.pathsuffix");
 print(suffix);
 
 var newTarget = target+"/users";
 context.setVariable("target.url", newTarget);
 
 if (suffix !== "") {
     newTarget = newTarget + suffix;
     context.setVariable("target.url", newTarget);
 }
