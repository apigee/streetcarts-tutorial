 var username = context.getVariable("request.formparam.username");
 var password = context.getVariable("request.formparam.password");
 
 // TBD: Code to validate the user. We would ask BaaS to return a User object
 // that has the sumbitted username and password. 
 
 
 var valid = true;
 var ownerId = "4ab08a6a-6d16-11e5-817d-a9b5da1cd192"; // returned from BaaS
 
 if (valid) {
    context.setVariable("streetcarts.user.valid", "true");
    context.setVariable("streetcarts.user.id", ownerId);
 } else {
     context.setVariable("streetcarts.user.valid", "false");
 }
