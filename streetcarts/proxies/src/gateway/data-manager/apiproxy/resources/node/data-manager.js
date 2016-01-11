var request = require('request');
var async = require('async');
var apigee = require('apigee-access'); 

var host = 'https://api.usergrid.com';
var appPath = '/docfood/foodcarttest';
var clientID;
var clientSecret;

//var orgVault = apigee.getVault('streetcarts', 'docfood');   
//orgVault.get('docfood-client-id', function(err, secretValue) {
//    clientID = secretValue;
//});
//orgVault.get('docfood-client-secret', function(err, secretValue) {
//    clientSecret = secretValue;
//});

module.exports = {

    // Carts //

    // Create a new cart.
    addNewCart: function (args, callback) {
        
        endpointPath = '/foodcarts';
        
        var uri = host + appPath + endpointPath;

        var options = {
            uri: uri,
            body: JSON.stringify(args.newValues),
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
    
    // Get the list of carts
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
                    cartList.foodcarts = cartList.entities;
                    delete cartList.entities;
                    callback(null, JSON.stringify(cartList));
                });
            }
        });
    },
    
    // Get a cart by ID
    getCart: function (cartUUID, callback) {
        
        endpointPath = "/foodcarts/" + cartUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                if (error.statusCode == 401) {
                    error.message = "Unable to find a food cart with ID "+ 
                        cartUUID;
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }            
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    
    // Get carts owned by a user
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
                    cartList.foodcarts = cartList.entities;
                    delete cartList.entities;
                    callback(null, JSON.stringify(cartList));
                });                
            }
        });
    },
    
    // Update a cart
    updateDetailsForCart: function (args, callback) {
        
        endpointPath = "/foodcarts/" + args.cartUUID;

        var uri = host + appPath + endpointPath;
        
        options = {
            uri: uri,
            body: JSON.stringify(args.newValues),
            method: "PUT"
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
    
    // Delete a cart
    deleteCart: function (cartUUID, callback) {
        
        endpointPath = "/foodcarts/" + cartUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "DELETE"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                if (error.statusCode == 401) {                
                    error.message = "Unable to find a food cart with ID "+ 
                        cartUUID;
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }            
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    
    // Delete an item
    deleteItem: function (itemUUID, callback) {
        
        endpointPath = "/items/" + itemUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "DELETE"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                if (error.statusCode == 401) {                
                    error.message = "Unable to find an item with ID "+ 
                        itemUUID;
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }            
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    // Menus //
    
    // Create a new menu
    addNewMenu: function (args, callback) {
        var cartID = args.cartUUID;
        var menuData = args.newValues;
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
    
    // Get a list of all menus
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
                    }, function(error){
                        if(error) {
                            callback(error, null);
                        } else {
                            callback(null, JSON.stringify(menuList));
                        }
                    });              
                });
            }
        });
    },
    
    // Get a menu by its ID
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
                if (error.statusCode == 401) {                
                    error.message = "Unable to find a menu with ID "+ 
                        menuUUID;                    
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }            
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(menuData){
                    menu = menuData;
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

            }
        });
    },
    
    // Add an existing item to a menu
    addItemToMenu: function (args, callback) {

        endpointPath = "/menus/" + args.menuUUID + 
            "/includes/items/" + args.itemUUID;
        
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
    
    // Create an item and add it to a menu
    addNewItemToMenu: function (args, callback) {

        var cartID = args.newValues.cartID;
        var itemData = args.newValues;
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
    
    // Remove an item from a menu
    removeItemFromMenu: function (args, callback) {

        endpointPath = "/menus/" + args.menuUUID + 
            "/includes/items/" + args.itemUUID;
        
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
    
    // Get the menus for a cart
    getMenusForCart: function (cartUUID, callback) {
        
        endpointPath = '/foodcarts/' + cartUUID + '/publishes';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                if (error.statusCode == 401) {                
                    error.message = "Unable to find a food cart with ID "+ 
                        cartUUID;
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }            
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
    
    // Get the items on a menu.
    getItemsForMenu: function (menuUUID, callback) {
        
        endpointPath = '/menus/' + menuUUID + '/includes';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };

        return makeRequest(options, function (error, response) {
            if (error) {
                if (error.statusCode == 401) {                
                    error.message = "Unable to find a menu with ID "+ 
                        menuUUID;                    
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }            
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
    
    // Items //
    
    // Create a new item
    addNewItem: function (args, callback) {

        var cartID = args.cartUUID;
        var itemData = args.newValues;
        itemData.cartID = cartID;
        
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
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    
    // Get the details for an item
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
    
    // Get the items for a cart
    getItemsForCart: function (cartUUID, callback) {
        
        endpointPath = '/foodcarts/' + cartUUID + '/offers/items';
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                if (error.statusCode == 401) {                
                    error.message = "Unable to find a food cart with ID "+ 
                        cartUUID;
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }            
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
    
    // Get the details for an item on a menu
    getDetailsForItemInMenu: function (args, callback) {
        
        endpointPath = "/menus/" + args.menuUUID + "/includes/items/" +
            args.itemUUID;

        var uri = host + appPath + endpointPath;
        
        console.log(uri);
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        makeRequest(options, function (error, response) {
            if (error) {
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
    
    // Update an item
    updateDetailsForItem: function (args, callback) {
        
        var itemUUID = args.itemUUID;
        
        endpointPath = "/items/" + itemUUID;

        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };

        return makeRequest(options, function (error, response) {
            if (error) {
                if (error.statusCode == 401) {                
                    error.message = "Unable to find a menu item with ID "+ 
                        itemUUID;                    
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }            
            } else {
            
                var options = {
                    uri: uri,
                    body: JSON.stringify(args.newValues),
                    method: "PUT"
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
            }
        });        
    },
    
    // Delete an item
    deleteItem: function (itemUUID, callback) {
        
        endpointPath = "/items/" + itemUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "DELETE"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                if (error.statusCode == 401) {                
                    error.message = "Unable to find an item with ID "+ 
                        itemUUID;
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }            
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    
    // Reviews // 
    
    // Create a new review
    addNewReview: function (args, callback) {
        
        var cartID = args.cartUUID;
        var reviewData = args.newValues;        
        reviewData.cartID = cartID;
        
        endpointPath = '/foodcarts/' + cartID + '/reviewedIn/reviews';
        
        var uri = host + appPath + endpointPath;
        console.log(uri);
        console.log(reviewData);
        
        var options = {
            uri: uri,
            body: JSON.stringify(reviewData),
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
    
    // Get review for a cart
    getReviewsForCart: function (cartUUID, callback) {
        
        endpointPath = '/foodcarts/' + cartUUID + '/reviewedIn/reviews';
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
                streamlineResponseArray(entities, function(reviewList){
                    reviewList.reviews = reviewList.entities;
                    delete reviewList.entities;
                    callback(null, JSON.stringify(reviewList));
                });
            }
        });
    },
    
    // Get details for a review
    getDetailsForReview: function (reviewUUID, callback) {
        
        endpointPath = "/reviews/" + reviewUUID;
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
    
    // Update a review
    updateDetailsForReview: function (args, callback) {
        
        endpointPath = "/reviews/" + args.reviewUUID;

        var uri = host + appPath + endpointPath;
        
        options = {
            uri: uri,
            body: JSON.stringify(args.newValues),
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
    
    // Delete a review
    deleteReview: function (reviewUUID, callback) {
        
        endpointPath = "/reviews/" + reviewUUID;
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
    
    // Users //
    
    // Get the list of users
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
    
    // Get a user by ID
    getUser: function (userUUID, callback) {
        
        endpointPath = "/users/" + userUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                if (error.statusCode == 401) {                
                    error.message = "Unable to find a user with ID "+ 
                        userUUID;
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }            
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    
    // Create a user account
    registerUser: function (userData, isOwner, callback) {
        
        console.log(userData);
        
        isOwner = true;
        
        endpointPath = '/users';
        console.log("username: " + userData.username);
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
                    callback(error, null);
                } else {
                    var entity = JSON.parse(response)['entities'][0];
                    streamlineResponseEntity(entity, function(streamlinedResponse){
                        if (isOwner) {
                            module.exports.addOwner(streamlinedResponse.uuid, function(error, entity){
                                if (error) {
                                    callback(error, null);
                                } else {
                                    callback(null, JSON.stringify(streamlinedResponse));              
                                }
                            });
                        }
                    });
                }
            });            
        }
    },

    // Check that a user is in the data store
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
                var entity = JSON.parse(response);
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },

    // Check that a user is in the data store
    addOwner: function (userUUID, callback) {
        
        endpointPath = "/groups/owners/users/" + userUUID;
        var uri = host + appPath + endpointPath;
        
        var options = {
            uri: uri,
            method: "POST"
        };
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var entity = JSON.parse(response);
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }
        });
    },
    
    // Delete a user account
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
    },
    
    // true if userUUID has permission to create carts.
    ownsCart: function (userUUID, cartUUID, callback) {

        console.log("user ID: " + userUUID);
     
        var pathCartID = cartUUID.replace(/-/g, ".");
    
        endpointPath = "/groups/foodcarts/" + pathCartID + "/owners/users";
        console.log(endpointPath);
        var uri = host + appPath + endpointPath;
    
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            var isOwner = false;
            if (error) {
                error.message = "Unable to find that cart's owners.";
                callback(error, false);
            } else {
                var userEntities = JSON.parse(response)['entities'];
                
                if (userEntities.length > 0) {
                    async.each(userEntities, function(userEntity, callback) {
                    
                        var ownerUUID = userEntity.uuid;
                        if (ownerUUID === userUUID) {
                            isOwner = true;
                        }
                        callback(null, isOwner);
                    }, function(error) {
                        if(error) {
                            callback(error, null);
                        } else {
                            callback(null, isOwner);
                        }
                    });                
                } else {
                    callback(null, isOwner);
                }            
            }
        });
    },
    
    // true if userUUID has permission to edit cart data, create
    // new carts, and add users as cart editors.
    isOwner: function (userUUID, callback) {

        console.log("user ID: " + userUUID);
    
        endpointPath = "/groups/owners/users";
        console.log(endpointPath);
        var uri = host + appPath + endpointPath;
    
        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            var isOwner = false;
            if (error) {
                error.message = "Unable to find that cart's owners.";
                callback(error, false);
            } else {
                var userEntities = JSON.parse(response)['entities'];
                
                if (userEntities.length > 0) {
                    async.each(userEntities, function(userEntity, callback) {
                    
                        var ownerUUID = userEntity.uuid;
                        if (ownerUUID === userUUID) {
                            isOwner = true;
                        }
                        callback(null, isOwner);
                    }, function(error) {
                        if(error) {
                            callback(error, null);
                        } else {
                            callback(null, isOwner);
                        }
                    });                
                } else {
                    callback(null, isOwner);
                }            
            }
        });
    }

};

// Make RESTful requests to the data store. All requests
// are made through this function.
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

// Remove unwanted properties from arrayed entity data returned by 
// the data store.
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

// Removed unwanted properties from an entity returned by 
// the data store.
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
        if (property)
        {
            delete responseData[property];            
        }
    }
    callback(responseData);
}
