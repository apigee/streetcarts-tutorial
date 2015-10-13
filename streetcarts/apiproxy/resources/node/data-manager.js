var request = require('request');

var host = 'https://api.usergrid.com';
var appPath = '/docfood/foodcarttest';
var endpointPath = '';
var queryParams = '';
var token = '';
var path = '';

module.exports = {
    getAllCarts: function (args, callback) {
        
        endpointPath = '/foodcarts';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, response);
            }
        });
    },
    getCartsOwnedByUser: function (userUUID, callback) {
        
        endpointPath = '/users/' + userUUID + '/owns';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, response);
            }
        });
    },
    getMenusForCart: function (cartUUID, callback) {
        
        endpointPath = '/foodcarts/' + cartUUID + '/publishes';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, response);
            }
        });
    },
    getItemsForMenu: function (menuUUID, callback) {
        
        endpointPath = '/menus/' + menuUUID + '/includes';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, response);
            }
        });
    },
    getDetailsForItem: function (itemUUID, callback) {
        
        endpointPath = "/items/" + itemUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, response);
            }
        });
    },
    addNewItem: function (itemData, callback) {
        
        var cartID = itemData.cartID;
        
        endpointPath = "/foodcarts/" + cartID + "/offers/items";
        
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            body: JSON.stringify(itemData),
            method: "POST"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, response);
            }
        });
    },
    registerUser: function (userData, callback) {
        
        console.log(userData);
        
        endpointPath = '/users';
        
        // Make sure the client sent a username.
        if (! userData.username) {
            console.log('No username set!');
            
            var errorObject = new Error();
            errorObject.message = "No username set. A unique username is required.";
            errorObject.statusCode = "";
            errorObject.errorType = "";
            
            callback(errorObject, null);
        }
        // Make sure the client sent a password.
        if (userData.username && ! userData.password) {
            console.log('No password set!');
            
            var errorObject = new Error();
            errorObject.message = "No password set.";
            errorObject.statusCode = "";
            errorObject.errorType = "";
            
            callback(errorObject, null);
        }
        // Try to create the user account. else if (userData.username && userData.password) {
        var uri = host + appPath + endpointPath;
        var options = {
            uri: uri,
            body: JSON.stringify(userData),
            method: "POST"
        };
        return makeRequest(options, function (error, response) {
            if (error) {
                console.log("Got an error.");
                callback(error, null);
            } else {
                console.log("Success.");
                callback(null, response);
            }
        });
    },
    authenticateUser: function (credentials, callback) {
        
        endpointPath = "/token";
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            body: JSON.stringify(credentials),
            method: "POST"
        };
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, response);
            }
        });
    }
};


function makeRequest(options, callback) {
    
    request(options, function (error, response, body) {
        
        var errorObject = new Error();
        
        if (error) {
            errorObject.message = error.message;
            callback(errorObject, null);
        } else if (response && response.statusCode != 200) {
            var responseBody = JSON.parse(body);
            
            var errorObject = new Error();
            errorObject.message = responseBody.error_description;
            errorObject.statusCode = response.statusCode;
            errorObject.errorType = responseBody.error;
            
            callback(errorObject, response);
        } else {
            callback(null, body);
        }
    });
}
