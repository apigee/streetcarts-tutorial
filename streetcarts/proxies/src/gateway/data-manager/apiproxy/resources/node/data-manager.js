var request = require('request');
var async = require('async');

var host = 'https://api.usergrid.com';
var appPath = '/docfood/foodcarttest';
var endpointPath = '';
var token = '';

module.exports = {
    addNewCart: function (args, callback) {
        
        endpointPath = '/foodcarts';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            body: JSON.stringify(args.new_values),
            method: "POST"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    updateDetailsForCart: function (args, callback) {
        
        endpointPath = "/foodcarts/" + args.cart_uuid;

        var uri = host + appPath + endpointPath;
        
        options = {
            uri: uri,
            body: JSON.stringify(args.new_values),
            method: "PUT"
        };

        return makeRequest(options, function (error, response) {
            if (error) {
                console.log(JSON.stringify(error));
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                console.log(entity);
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    deleteCart: function (cartUUID, callback) {
        
        endpointPath = "/foodcarts/" + cartUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "DELETE"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    getCartList: function (args, callback) {
        
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
                var entities = JSON.parse(response)['entities'];
                streamlineResponseArray(entities, function(cartList){
                    cartList.carts = cartList.entities;
                    delete cartList.entities;
                    callback(null, JSON.stringify(cartList));
                });
            }
        });
    },
    getCart: function (cartUUID, callback) {
        
        endpointPath = "/foodcarts/" + cartUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
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
                var entities = JSON.parse(response)['entities'];
                streamlineResponseArray(entities, function(cartList){
                    cartList.carts = cartList.entities;
                    delete cartList.entities;
                    callback(null, JSON.stringify(cartList));
                });                
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
                var entities = JSON.parse(response)['entities'];
                streamlineResponseArray(entities, function(menuList){
                    menuList.menus = menuList.entities;
                    delete menuList.entities;
                    callback(null, JSON.stringify(menuList));
                });
            }
        });
    },
    getItemsForCart: function (cartUUID, callback) {
        
        endpointPath = '/foodcarts/' + cartUUID + '/offers';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entities = JSON.parse(response)['entities'];
                streamlineResponseArray(entities, function(menuList){
                    menuList.menus = menuList.entities;
                    delete menuList.entities;
                    callback(null, JSON.stringify(menuList));
                });
            }
        });
    },
    getMenuList: function (args, callback) {
        
        var menuList = [];
        
        endpointPath = '/menus';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entities = JSON.parse(response)['entities'];
                streamlineResponseArray(entities, function(menuListData){
                    menuListData.menus = menuListData.entities;
                    delete menuListData.entities;
                    menuList = menuListData;
                    
                    async.each(menuList.menus, function(menuItem, callback) {
                    
                        var cartUUID = menuItem.cartID;
                        endpointPath = '/foodcarts/' + cartUUID;

                        uri = host + appPath + endpointPath;            
                        options = {
                            uri: uri,
                            method: "GET"
                        };

                        makeRequest(options, function (error, response) {
                            if (error) {
                                callback(error, null);
                            } else {
                                var cart = JSON.parse(response)['entities'][0];
                                menuItem.cartName = cart.name;
                                callback();
                            }
                        });
                    }, function(err){
                        if(err) {
                            console.log('Could not add the menu name: ' + err);
                        } else {
                            callback(null, JSON.stringify(menuList));
                        }
                    });              
                });
            }
        });
    },
    getMenu: function (menuUUID, callback) {

        var menu;
        
        endpointPath = '/menus/' + menuUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(menuData){
                    menu = menuData;
                });
            }
        });

        endpointPath = '/menus/' + menuUUID + '/includes';
        uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entities = JSON.parse(response)['entities'];
                streamlineResponseArray(entities, function(itemList) {
                    menu['items'] = itemList.entities.slice();
                    callback(null, JSON.stringify(menu));
                });
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
                var entities = JSON.parse(response)['entities'];
                streamlineResponseArray(entities, function(itemList){
                    itemList.items = itemList.entities;
                    delete itemList.entities;
                    callback(null, JSON.stringify(itemList));
                });
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
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    getDetailsForItemInMenu: function (args, callback) {
        
        endpointPath = "/menus/" + args.menu_uuid + "/includes/items/" +
            args.item_uuid;

        var uri = host + appPath + endpointPath;
        
        console.log(uri);
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        makeRequest(options, function (error, response) {
            if (error) {
                console.log(error);
                error.message = "That item appears not to be in this menu.";
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    updateDetailsForItem: function (args, callback) {
        
        endpointPath = "/menus/" + args.menu_uuid + "/includes/items/" +
            args.item_uuid;

        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        var entity;
        
        makeRequest(options, function (error, response) {
            if (error) {
                console.log("error: " + JSON.stringify(error));
                error.message = "That item appears not to be in this menu.";
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                console.log(entity);

                options = {
                    uri: uri,
                    body: JSON.stringify(args.new_values),
                    method: "PUT"
                };
        
                return makeRequest(options, function (error, response) {
                    if (error) {
                        console.log(JSON.stringify(error));
                        callback(error, null);
                    } else {
                        var entity = JSON.parse(response)['entities'][0];
                        console.log(entity);
                        streamlineResponseEntity(entity, function(streamlinedResponse){
                            callback(null, JSON.stringify(streamlinedResponse));
                        });
                    }
                });
            }
        });

    },
    addNewItem: function (args, callback) {

        var cartID = args.cart_uuid;
        var itemData = args.new_values;
        endpointPath = "/foodcarts/" + cartID + "/offers/items";
        console.log(cartID);
        itemData.cartID = cartID;
        
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
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    addNewMenu: function (args, callback) {
        var cartID = args.cart_uuid;
        var menuData = args.new_values;
        menuData.cartID = cartID;
        
        endpointPath = "/foodcarts/" + cartID + "/publishes/menus";
        
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            body: JSON.stringify(menuData),
            method: "POST"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    addItemToMenu: function (args, callback) {

        endpointPath = "/menus/" + args.menu_uuid + 
            "/includes/items/" + args.item_uuid;
        
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "POST"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    addNewItemToMenu: function (args, callback) {

        var cartID = args.new_values.cartID;
        var itemData = args.new_values;
        itemData.cartID = cartID;

        endpointPath = "/menus/" + args.menuUUID + 
            "/includes/items ";
        
        var uri = host + appPath + endpointPath;
        console.log(uri);
        var options = {
            uri: uri,
            body: JSON.stringify(itemData),
            method: "POST"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    removeItemFromMenu: function (args, callback) {

        endpointPath = "/menus/" + args.menu_uuid + 
            "/includes/items/" + args.item_uuid;
        
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "DELETE"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    getUserList: function (args, callback) {
        
        endpointPath = '/users';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entities = JSON.parse(response)['entities'];
                streamlineResponseArray(entities, function(userList){
                    userList.users = userList.entities;
                    delete userList.entities;
                    callback(null, JSON.stringify(userList));
                });
            }
        });
    },
    getUser: function (userUUID, callback) {
        
        endpointPath = "/users/" + userUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    registerUser: function (userData, callback) {
        
        console.log(userData);
        
        endpointPath = '/users';
        
        // Make sure the client sent a username.
        if (!(userData.username)) {
            var errorObject = new Error();
            errorObject.message = "No username set. A unique username is required.";
            errorObject.statusCode = "";
            errorObject.errorType = "";
            
            callback(errorObject, null);
        }
        // Make sure the client sent a password.
        if ((userData.username) && !(userData.password)) {
            var errorObject = new Error();
            errorObject.message = "No password set.";
            errorObject.statusCode = "";
            errorObject.errorType = "";
            
            callback(errorObject, null);
        }
        else {
            // Try to create the user account.
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
                    var entity = JSON.parse(response)['entities'][0];
                    streamlineResponseEntity(entity, function(streamlinedResponse){
                        callback(null, JSON.stringify(streamlinedResponse));
                    });
                }
            });            
        }
    },
    authenticateUser: function (credentials, callback) {
        
        endpointPath = "/token";
        var uri = host + appPath + endpointPath;
        credentials.grant_type = "password";
        
        var options = {
            uri: uri,
            body: JSON.stringify(credentials),
            method: "POST"
        };
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                console.log(response);
                var message = '{"message":"User found.","statusCode":"200"}';
                callback(null, message);
            }
        });
    },
    deleteUser: function (userUUID, callback) {
        
        endpointPath = "/users/" + userUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "DELETE"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                error.message = "That user ID is not in the system.";
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
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

function streamlineResponseArray(entityArray, callback) {

    var entityList = {
        entities:[]
    };
    for (var i = 0; i < entityArray.length; i++){                
        streamlineResponseEntity(entityArray[i], function(streamlinedResponse){
            entityList.entities[i] = streamlinedResponse;
        });
    }
    callback(entityList);
}

function streamlineResponseEntity(responseData, callback) {

    var unwantedProperties = [
        "action",
        "application",
        "params",
        "path",
        "uri",
        "timestamp",
        "duration",
        "organization",
        "applicationName",
        "type",
        "created",
        "modified",
        "metadata"
    ];

    var arrayLength = unwantedProperties.length;
    for (var i = 0; i < arrayLength; i++) {
        var property = unwantedProperties[i];
        delete responseData[property];
    }
    callback(responseData);
}
