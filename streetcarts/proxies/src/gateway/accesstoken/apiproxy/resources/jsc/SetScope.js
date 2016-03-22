/**
 * Create a scope value based on which groups the authenticating user
 * belongs to.
 */
var response = JSON.parse(context.getVariable("streetcarts.response"));

var userScope = "";

if (response.statusCode == 400) {
    var errorDetail = response.message;
    setResponse(response.statusCode, "Unknown user.", errorDetail);
    context.setVariable("streetcarts.auth.status.code", 400);
} else {
    try {
        /**
         * Set scope values based on which data store user groups 
         * the user is a member of.
         */
        if (response.user.user_groups && response.user.user_groups.length > 0) {
            var userGroups = response.user.user_groups;
            for (var i = 0; i < userGroups.length; i++) {
                var groupName = userGroups[i].name;
                if (groupName === "owners") {
                    userScope = userScope + 
                        "owner.read owner.create owner.delete owner.update ";
                }
                if (groupName.indexOf("/managers/menus") > 0) {
                    userScope = userScope + "manager.read manager.update ";
                }
                if (groupName === "members") {
                    userScope = userScope + "reviewer.read reviewer.create ";
                }
            }
            // Trim the scope value and set it to a variable for retrieval later.
            userScope = userScope.replace(/(^[,\s]+)|([,\s]+$)/g, '');
            context.setVariable("streetcarts.user.scope", userScope);
    	    context.setVariable("streetcarts.auth.status.code", 200);
        }
    } catch (error) {
        var errorDetail = "User is not a member of any user groups";
        setResponse(401, "Permission denied.", errorDetail);
    }
}


function setResponse(status, message, detail) {

	var errorJSON = {};
	errorJSON.error = {};
	errorJSON.error.statusCode = status;
	errorJSON.error.message = message;
	errorJSON.error.detail = detail;

	var errorContent = JSON.stringify(errorJSON);

	context.setVariable("streetcarts.auth.status.code", status);
	context.setVariable("streetcarts.error.message", message);
	context.setVariable("streetcarts.error.header.Content-Type", "application/json");
	context.setVariable("streetcarts.error.content", errorContent);
}