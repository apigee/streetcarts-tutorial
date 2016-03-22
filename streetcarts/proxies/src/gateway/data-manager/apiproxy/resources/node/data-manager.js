var request = require('request');
var async = require('async');
var apigee = require('apigee-access'); 

var host = 'BAASAPIREPLACE';
var appPath = '/BAASORGREPLACE/BAASAPPREPLACE';
var edgeVault = 'streetcarts';
var edgeVaultScope = 'environment';
var dataStoreIdEntry = 'datastore-client-id';
var dataStoreSecretEntry = 'datastore-client-secret';
var dataStoreTokenEntry = 'datastore-client-token';
var dataStoreClientToken = '';

module.exports = {

    // Functions supporting the foodcarts proxy //

    /**
     * Creates a new foodcart entity in the data store.
     * Along with creating the entity, this function
     * sets up user groups and permissions needed to 
     * control PUT/POST/DELETE access to the foodcart so that
     * only the cart's owner(s) can make changes to it.
     */
    addNewCart: function (args, callback) {
        
        var userBaasToken = args.baasToken;
        var tokenParam = "?access_token=" + userBaasToken;
        
        endpointPath = '/foodcarts' + tokenParam;
        
        var uri = host + appPath + endpointPath;
        var cartInfo = args.newValues;
        
        console.log("Adding new cart: " + uri);
        
        var ownerUUID;
        
        // Make sure we have an ownerID in the cart entity.
        if (cartInfo.hasOwnProperty("ownerID") 
            && cartInfo.ownerID !== null
            && cartInfo.ownerID !== "") {
            ownerUUID = cartInfo.ownerID; 
        } else {
            ownerUUID = args.requestingUserUUID;
            cartInfo.ownerID = ownerUUID;
        }
        
        var options = {
            uri: uri,
            body: JSON.stringify(args.newValues),
            method: "POST"
        };
        
        return makeRequest(options, function (error, newCartResponse) {
            if (error) {
                callback(error, null);
            } else {
                var cart = JSON.parse(newCartResponse)['entities'][0];
                
                createCartOwnerUserGroup(cart.uuid,
                    function(error, response) {
                    if (error) {
                        callback(error, null);
                    } else {
                        var groupEntity = response.entities[0];
                        var groupPath = groupEntity.path;
                        var groupName = groupEntity.name;
                        
                        secureCartOwnerUserGroup(cart.uuid,
                            groupPath, function(error, response) {
                            if (error) {
                                callback(error, null);
                            } else {
                                addUserToGroup(ownerUUID, groupPath, 
                                    function(error, response) {
                                    if (error) {
                                        callback(error, null);
                                    } else {
//                                        callback(null, JSON.stringify(cart));
                                        createMenuManagerUserGroup(cart.uuid,
                                            function(error, response) {
                                            if (error) {
                                                callback(error, null);
                                            } else {
                                                var groupEntity = response.entities[0];
                                                var groupPath = groupEntity.path;
                                                var groupName = groupEntity.name;
                                                
                                                secureMenuManagerUserGroup(cart.uuid,
                                                    groupPath, function(error, response) {
                                                    if (error) {
                                                        callback(error, null);
                                                    } else {
                                                        addUserToGroup(ownerUUID, groupPath, 
                                                            function(error, response) {
                                                            if (error) {
                                                                callback(error, null);
                                                            } else {
                                                                callback(null, JSON.stringify(cart));
                                                            }
                                                        });                                    
                                                    }
                                                });
                                            }
                                        });

                                    }
                                });                                    
                            }
                        });
                    }
                });
            }
        });
    },

    /**
     * Gets a list of all the foodcarts in the data store.
     */
    getCartList: function (args, callback) {
        
        endpointPath = '/foodcarts';
        var uri = host + appPath + endpointPath;
        
        console.log("Getting the cart list: " + uri);
        
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
    
    /**
     * Get a single foodcart using the cart's UUID.
     */
     getCart: function (cartUUID, callback) {
        
        endpointPath = "/foodcarts/" + cartUUID;
        var uri = host + appPath + endpointPath;
        
        console.log("Getting a cart: " + uri);
        
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
                callback(error, null);
            } else {
                var entity = JSON.parse(response)['entities'][0];
                streamlineResponseEntity(entity, function(streamlinedResponse){
                    callback(null, JSON.stringify(streamlinedResponse));
                });
            }            
        });
    },

    /**
     * Gets all of the foodcarts owned by the specified
     * user.
     */
    getCartsOwnedByUser: function (userUUID, callback) {
        
        endpointPath = '/users/' + userUUID + '/owns';
        var uri = host + appPath + endpointPath;
        
        console.log("Getting carts owned by user: " + uri);

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
    
    /**
     * Updates the details for the specified foodcart.
     */
    updateDetailsForCart: function (args, callback) {
        
        var userBaasToken = args.baasToken;
        var tokenParam = "?access_token=" + userBaasToken;
        
        endpointPath = "/foodcarts/" + args.cartUUID + tokenParam;
        var uri = host + appPath + endpointPath;
        
        console.log("Updated foodcart: " + uri);
        
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
    
    /**
     * Deletes the entity representing a foodcart. This function deletes
     * the foodcart entity and all menus and menu items created for the 
     * foodcart. Finally, it removes user groups, roles, and permissions 
     * associated with the foodcart. 
     */
    deleteCart: function (cartUUID, userBaasToken, callback) {
        
        var tokenParam = "?access_token=" + userBaasToken;
        
        // Get a list of the items so they can be deleted 
        // after the cart is deleted.
        module.exports.getItemsForCart(cartUUID, function(error, items) {
            if (error) {
                callback(error, null);
            } else {
                // Get a list of the menus so they can be deleted 
                // after the cart is deleted.
                var cartItems = JSON.parse(items).items;
                
                module.exports.getMenusForCart(cartUUID, function(error, menus) {
                    if (error) {
                        callback(error, null);
                    } else {
                    
                        var cartMenus = JSON.parse(menus).menus;
                        
                        // Delete the cart.
                        endpointPath = "/foodcarts/" + cartUUID + tokenParam;
                        var uri = host + appPath + endpointPath;
                        
                        console.log("Deleting a cart: " + uri);
                        
                        var options = {
                            uri: uri,
                            method: "DELETE"
                        };
                        return makeRequest(options, function (error, cartDeleteResponse) {
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
                                
                                // Now that we've deleted the cart, delete the
                                // menus and items created for it.
                                module.exports.deleteMenusAndItems(cartMenus, 
                                    cartItems, userBaasToken, function (error, response) {                                    
                                    if (error) {
                                        callback(error, null);
                                    } else {
                                        // Delete the user group for the cart's owners
                                        deleteCartOwnerUserGroup(cartUUID, 
                                            function (error, response) {
                                            if (error) {
                                                callback(error, null);
                                            } else {
                                                // Delete the roles and permissions that 
                                                // protected access to the cart.
                                                removeCartSecurity(cartUUID, 
                                                function (error, response) {
                                                    if (error) {
                                                        console.log(error);
                                                        callback(error, null);
                                                    } else {
                                                        callback(null, cartDeleteResponse);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                                
                            }
                        });
                    }
                });
            }
        });
    },
    
    /**
     * Deletes the specified menus and menu items. This is useful for
     * cleaning up after deleting a foodcart by deleting all of the
     * menus and items associated with it.
     */
    deleteMenusAndItems: function (menus, items, baasToken, callback) {

        // Delete the items
        if (items.length > 0) {
            async.each(items, function(item, callback) {

                module.exports.deleteItem(item.uuid, baasToken, function (error, response) {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback();
                    }
                });
            }, function(error) {
                callback(error, null);
            });
        } else {
        
            // Delete the menus
           if (menus.length > 0) {
               async.each(menus, function(menu, callback) {
   
                   module.exports.deleteMenu(menu.uuid, baasToken, function (error, response) {
                       if (error) {
                           callback(error, null);
                       } else {
                           callback();
                       }
                   });
               }, function(error) {
                   callback(error, null);
               });                
           } else {
               callback();
           }
        }
    },
    
    /**
     * Creates a new menu item for a foodcart (doesn't
     * add the item to a menu).
     */
    addNewItem: function (args, callback) {

        var tokenParam = "?access_token=" + args.baasToken;
        var cartUUID = args.cartUUID;
        var itemData = args.newValues;
        itemData.cartID = cartUUID;
        
        endpointPath = "/foodcarts/" + cartUUID + "/offers/items" + tokenParam;
        
        var uri = host + appPath + endpointPath;

        console.log("Adding a new item: " + uri + "\n" + JSON.stringify(itemData));

        var options = {
            uri: uri,
            body: JSON.stringify(itemData),
            method: "POST"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var item = JSON.parse(response)['entities'][0];
                
                // Now that the item is created, control access to it
                // by adding item-specific permissions to API BaaS.
                var pathCartID = cartUUID.replace(/-/g, ".");                
                var roleName = pathCartID + "-manager-menus";
                
                // Permissions to set in API BaaS.
                var permissionsList = {
                    permissions: [
                        { permission : "get,put,post,delete:/foodcarts/" + cartUUID + 
                            "/offers/" + item.uuid },
                        { permission : "get,put,post,delete:/menus/*/includes/" + item.uuid },
                        { permission : "get,put,post,delete:/items/" + item.uuid }
                    ]
                };

                assignPermissionsToRole(roleName, permissionsList, 
                    function(error, response) {
                    if (error) {
                        console.log(error);
                        callback(error, null);
                    } else {
                        streamlineResponseEntity(item, function(streamlinedResponse){
                            callback(null, JSON.stringify(streamlinedResponse));
                        });
                    }
                });
            }
        });
    },
    
    /**
     * Adds a new menu for a foodcart.
     */
    addNewMenu: function (args, callback) {
        var cartUUID = args.cartUUID;
        var menuData = args.newValues;
        var baasToken = args.baasToken;
        menuData.cartID = cartUUID;
        var tokenParam = "?access_token=" + baasToken
        
        endpointPath = "/foodcarts/" + cartUUID + "/publishes/menus" + tokenParam;        
        var uri = host + appPath + endpointPath;

        console.log("Adding a new menu: " + uri + "\n" + JSON.stringify(menuData));
        
        var options = {
            uri: uri,
            body: JSON.stringify(menuData),
            method: "POST"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
            
                var menu = JSON.parse(response)['entities'][0];
                
                // Create a user role with the permissions needed 
                // to control access to the new menu. 
                var pathCartID = cartUUID.replace(/-/g, ".");                
                var roleName = pathCartID + "-manager-menus";
                
                // Permissions to set in API BaaS.
                var permissionsList = 
                { permissions: [
                    { permission : "get,put,post,delete:/foodcarts/" + cartUUID + 
                        "/publishes/" + menu.uuid },
                    { permission : "get,put,post,delete:/menus/" + menu.uuid },
                    { permission : "get,put,post,delete:/menus/" + menu.uuid +
                        "/includes/*" }
                    ]
                };
                console.log('setting menu perms');
                
                assignPermissionsToRole(roleName, permissionsList, 
                    function(error, response) {
                    if (error) {
                        console.log(error);
                        callback(error, null);
                    } else {
                        streamlineResponseEntity(menu, function(streamlinedResponse){
                            callback(null, JSON.stringify(streamlinedResponse));
                        });
                    }
                });
            }
        });
    },
    
    // Functions supporting the menus proxy //
        
    /**
     * Gets a list of all the menus in the data store.
     */
    getMenuList: function (args, callback) {
        
        var menuList = [];
        
        endpointPath = '/menus';
        var uri = host + appPath + endpointPath;
        
        console.log("Getting a list of menus: " + uri);
        
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
    
    /**
     * Gets the specified menu.
     */
    getMenu: function (menuUUID, callback) {

        var menu;
        
        endpointPath = '/menus/' + menuUUID;
        var uri = host + appPath + endpointPath;
        
        console.log("Getting a menu: " + uri);
        
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
    
    /**
     * Associates an existing menu item with the 
     * specified menu.
     */
    addExistingItemToMenu: function (args, callback) {

        var tokenParam = "?access_token=" + args.baasToken;
        endpointPath = "/menus/" + args.menuUUID + 
            "/includes/items/" + args.itemUUID + tokenParam;
        
        var uri = host + appPath + endpointPath;
        
        console.log("Adding an item to a menu: " + uri);
        
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
    
    /**
     * Creates a menu item and adds it to a menu.
     */
    addNewItemToMenu: function (args, callback) {
    
        console.log("Add new item to menu: " + JSON.stringify(args));
        var item = args.newValues;
        var cartUUID = item.cartID;
        args.cartUUID = cartUUID;

        module.exports.addNewItem(args, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                var item = JSON.parse(response)['entities'][0];
                var itemUUID = item.uuid;
                var menuUUID = args.menuUUID;
                var tokenParam = "?access_token=" + args.baasToken;
        
                endpointPath = "/menus/" + menuUUID + "/includes/items/" + itemUUID + tokenParam;
                var uri = host + appPath + endpointPath;
        
                console.log("Adding a new item to a menu: " + uri);
                
                var options = {
                    uri: uri,
                    method: "POST"
                };
        
                return makeRequest(options, function (error, response) {
                    if (error) {
                        callback(error, null);
                    } else {
                        var item = JSON.parse(response)['entities'][0];
                        var pathCartID = cartUUID.replace(/-/g, ".");
                        var roleName = pathCartID + "-manager-menus";
                        
                        // Permissions to set in API BaaS.
                        var permissionsList = {
                            permissions: [
                                { permission : "get,put,post,delete:/menus/" + menuUUID + 
                                    "/includes/" + item.uuid }
                            ]
                        };
                        assignPermissionsToRole(roleName, permissionsList, 
                            function(error, response) {
                            if (error) {
                                console.log(error);
                                callback(error, null);
                            } else {
                                streamlineResponseEntity(item, function(streamlinedResponse){
                                    callback(null, JSON.stringify(streamlinedResponse));
                                });
                            }
                        });
                    }
                });
            }
        });
    },

    /**
     * Removes the specified menu item from the specified menu.
     */
    removeItemFromMenu: function (args, callback) {

        var tokenParam = "?access_token=" + args.baasToken;
        endpointPath = "/menus/" + args.menuUUID + 
            "/includes/items/" + args.itemUUID + tokenParam;
        
        var uri = host + appPath + endpointPath;
        
        console.log("Removing an item from a menu: " + uri);
        
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
    
    /**
     * Gets an array of all menus for a foodcart.
     */
    getMenusForCart: function (cartUUID, callback) {
        
        endpointPath = '/foodcarts/' + cartUUID + '/publishes';
        var uri = host + appPath + endpointPath;

        console.log("Getting the menus for a cart: " + uri);

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
    
    /**
     * Gets an array of the menu items on a menu.
     */
    getItemsForMenu: function (menuUUID, callback) {
        
        endpointPath = '/menus/' + menuUUID + '/includes';
        var uri = host + appPath + endpointPath;

        console.log("Getting the items on a menu: " + uri);

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
    
    /**
     * Deletes data about the specified menu.
     */
    deleteMenu: function (menuUUID, baasToken, callback) {
        
        var tokenParam = "?access_token=" + baasToken;
        var endpointPath = "/menus/" + menuUUID + tokenParam;
        var uri = host + appPath + endpointPath;

        console.log("Deleting a menu: " + uri);

        var options = {
            uri: uri,
            method: "DELETE"
        };
        
        return makeRequest(options, function (error, menuDeleteResponse) {
            if (error) {
                console.log('error deleting menu: ' + JSON.stringify(error));
                callback(error, null);
            } else {
                var cartUUID = JSON.parse(menuDeleteResponse).entities[0].cartID;
                
                // Now that the item is deleted, clean up by removing 
                // permissions settings specific to the item.
                var pathCartID = cartUUID.replace(/-/g, ".");
                var roleName = pathCartID + "-manager-menus";
                
                // Permissions to delete from API BaaS.
                var permissionsList = {
                    permissions: [
                        { permission : "get,put,post,delete:/menus/" + menuUUID },
                        { permission : "get,put,post,delete:/menus/" + menuUUID +
                            "/includes/*" },
                        { permission : "get,put,post,delete:/foodcarts/" + cartUUID + 
                            "/publishes/" + menuUUID }
                    ]
                };
                deletePermissionsFromRole(roleName, permissionsList, 
                    function(error, response) {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback(null, menuDeleteResponse);
                    }
                });
            }
        });
    },

    // Functions supporting the items proxy //
    
    /**
     * Gets details for the specified menu item.
     */
    getDetailsForItem: function (itemUUID, callback) {
        
        endpointPath = "/items/" + itemUUID;
        var uri = host + appPath + endpointPath;
        
        console.log("Getting details for an items: " + uri);
        
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
    
    /**
     * Gets the list of items for the specified foodcart.
     */
    getItemsForCart: function (cartUUID, callback) {
        
        endpointPath = '/foodcarts/' + cartUUID + '/offers/items';
        var uri = host + appPath + endpointPath;

        console.log("Getting the items for a cart: " + uri);

        var options = {
            uri: uri,
            method: "GET"
        };
        
        return makeRequest(options, function (error, response) {
            if (error) {
                console.log(error);
                if (error.statusCode == 401) {                
                    error.message = "Unable to find items for food cart "+ 
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
    
    /**
     * Gets the details for the specified menu item and menu.
     */
    getDetailsForItemInMenu: function (args, callback) {
        
        endpointPath = "/menus/" + args.menuUUID + "/includes/items/" +
            args.itemUUID;

        var uri = host + appPath + endpointPath;
        
        console.log("Getting the details for an item in a menu: " + uri);
        
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
    
    /**
     * Updates the information about the specified menu item.
     */
    updateDetailsForItem: function (args, callback) {
        
        var tokenParam = "?access_token=" + args.baasToken;
        var itemUUID = args.itemUUID;
        
        endpointPath = "/items/" + itemUUID + tokenParam;
        var uri = host + appPath + endpointPath;
        
        console.log("Updating the details for an item: " + uri + "\n" + 
            JSON.stringify(args.newValues));
        
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
    
    /**
     * Deletes data about the specified menu item.
     */
    deleteItem: function (itemUUID, baasToken, callback) {
        
        var tokenParam = "?access_token=" + baasToken;
        var endpointPath = "/items/" + itemUUID + tokenParam;
        var uri = host + appPath + endpointPath;

        console.log("Deleting an item: " + uri);

        var options = {
            uri: uri,
            method: "DELETE"
        };
        
        return makeRequest(options, function (error, itemDeleteResponse) {
            if (error) {
                if (error.statusCode == 401) {                
                    error.message = "Unable to delete item with ID "+ 
                        itemUUID;
                    callback(error, null);
                }
                else {
                    callback(error, null);
                }
            } else {
                var cartUUID = JSON.parse(itemDeleteResponse).entities[0].cartID;
                
                // Now that the item is deleted, clean up by removing 
                // permissions settings specific to the item.
                var pathCartID = cartUUID.replace(/-/g, ".");
                var roleName = pathCartID + "-manager-menus";
                
                // Permissions to delete from API BaaS.
                var permissionsList = {
                    permissions: [
                        { permission : "get,put,post,delete:/menus/*/includes/" + itemUUID },
                        { permission : "get,put,post,delete:/foodcarts/" + cartUUID + 
                            "/offers/" + itemUUID },
                        { permission : "get,put,post,delete:/items/" + itemUUID }
                    ]
                };
                deletePermissionsFromRole(roleName, permissionsList, 
                    function(error, response) {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback(null, itemDeleteResponse);
                    }
                });            
            }
        });
    },
    
    // Functions supporting the reviews proxy // 
    
    /**
     * Creates a new foodcart review.
     */
    addNewReview: function (args, callback) {
        
        var tokenParam = "?access_token=" + args.baasToken;
        var cartUUID = args.cartUUID;
        var reviewData = args.newValues;        
        reviewData.cartID = cartUUID;
        
        endpointPath = '/foodcarts/' + cartUUID + '/reviewedIn/reviews' + tokenParam;
        var uri = host + appPath + endpointPath;
        
        console.log("Adding a new review: " + uri + "\n" + JSON.stringify(reviewData));
        
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
    
    /**
     * Gets reviews for the specified foodcart.
     */
    getReviewsForCart: function (cartUUID, callback) {
        
        endpointPath = '/foodcarts/' + cartUUID + '/reviewedIn/reviews';
        var uri = host + appPath + endpointPath;

        console.log("Getting the reviews for a cart: " + uri);

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
    
    /**
     * Get details for the specified foodcart review.
     */
    getDetailsForReview: function (reviewUUID, callback) {
        
        endpointPath = "/reviews/" + reviewUUID;
        var uri = host + appPath + endpointPath;

        console.log("Getting the details for a review: " + uri);

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
    
    /**
     * Update information about the specified foodcart review.
     */
    updateDetailsForReview: function (args, callback) {
        
        var tokenParam = "?access_token=" + args.baasToken;
        endpointPath = "/reviews/" + args.reviewUUID + tokenParam;
        var uri = host + appPath + endpointPath;
        
        console.log("Updating a review: " + uri + "\n" + JSON.stringify(args.newValues));
        
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
    
    /**
     * Delete the specified foodcart review.
     */
    deleteReview: function (reviewUUID, baasToken, callback) {
        
        var tokenParam = "?access_token=" + baasToken;
        endpointPath = "/reviews/" + reviewUUID + tokenParam;
        var uri = host + appPath + endpointPath;

        console.log("Deleting a review: " + uri);

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
    
    // Functions supporting the users proxy. //
    
    /**
     * Gets a list of all StreetCarts registered users.
     */
    getUserList: function (args, callback) {
        
        endpointPath = '/users';
        var uri = host + appPath + endpointPath;

        console.log("Getting the list of users: " + uri);

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
    
    /**
     * Gets information about the specified user.
     */
    getUser: function (userUUID, callback) {
        
        endpointPath = "/users/" + userUUID;
        var uri = host + appPath + endpointPath;
        
        console.log("Getting a user's info: " + uri);
        
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
    
    /**
     * Registers a user by creating user entity for them in the 
     * data store.
     */
    registerUser: function (userData, isOwner, callback) {

        // Eventually, we might differentiate between users
        // who are foodcart owners and those who are just
        // registered. Currently, everyone gets owner status,
        // including the ability to create new foodcarts.
        isOwner = true;
        
        endpointPath = '/users';
        
        console.log("Preparing to register a user");
        
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

            console.log("Registering a user: " + uri + "\n" + JSON.stringify(userData));
            
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
                        addMember(streamlinedResponse.uuid, function(error, entity){
                            if (error) {
                                callback(error, null);
                            } else {
                                callback(null, JSON.stringify(streamlinedResponse));              
                            }
                        });
                        if (isOwner) {
                            addOwner(streamlinedResponse.uuid, function(error, entity){
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
    
    /**
     * Deletes the specified user account from the data store.
     */
//    deleteUser: function (userUUID, baasToken, callback) {
//        
//        var tokenParam = "?access_token=" + baasToken;
//        endpointPath = "/users/" + userUUID + tokenParam;
//        var uri = host + appPath + endpointPath;
//        
//        console.log("Deleting a user: " + uri);
//        
//        var options = {
//            uri: uri,
//            method: "DELETE"
//        };
//        
//        return makeRequest(options, function (error, response) {
//            if (error) {
//                error.message = "That user ID is not in the system.";
//                callback(error, null);
//            } else {
//                var entity = JSON.parse(response)['entities'][0];
//                streamlineResponseEntity(entity, function(streamlinedResponse){
//                    callback(null, JSON.stringify(streamlinedResponse));
//                });
//            }
//        });
//    },
    
    /**
     * Authenticate a user with API BaaS using their username 
     * and password. On a successful authentication, API BaaS
     * returns JSON that includes an access token. This token
     * is copied into the Edge-generated token for use with
     * subsequent requests by that user to BaaS.
     */
    authenticateUser: function (credentials, callback) {
        
        endpointPath = "/token";
        credentials.grant_type = "password";
        var uri = host + appPath + endpointPath;
        
        console.log("Authenticating a user: " + uri + "\n" + 
            JSON.stringify(credentials));

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
                getGroupsForUser(entity.user.uuid, function(error, groupList) {
                    if (error) {
                        console.log('groups auth error: ' + JSON.stringify(error)); 
                        callback(error, null);
                    } else {
                        entity.user.user_groups = groupList;                        
                        streamlineResponseEntity(entity, function(error,
                            streamlinedResponse){
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
    
};

// The following are utility functions called from within this
// module.


// Functions to manage security.

/**
 * Adds the specified user to the group of users who can create
 * foodcarts.
 */
function addOwner (userUUID, callback) {
    
    endpointPath = "/groups/owners/users/" + userUUID;
    var uri = host + appPath + endpointPath;

    console.log("Adding an owner user: " + uri);

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
}

/**
 * Adds the specified user to the group of users who can browse
 * carts and write reviews.
 */
function addMember (userUUID, callback) {
    
    endpointPath = "/groups/members/users/" + userUUID;
    var uri = host + appPath + endpointPath;

    console.log("Adding an member user: " + uri);

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
}

/**
 * true if the specified user has permission to edit cart data, create
 * new carts, and add users as cart editors.
 */
function getGroupsForUser (userUUID, callback) {

    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error, null);
        } else {
        
            endpointPath = "/users/" + userUUID + "/groups"  + 
                '?access_token=' + dataStoreClientToken;
            var uri = host + appPath + endpointPath;
            
            console.log("Getting the list of groups a user is in: " + uri);
    
            var options = {
                uri: uri,
                method: "GET"
            };
        
            return makeRequest(options, function (error, response) {
                if (error) {
                    error.message = "Unable to get the list of groups for user ID:" +
                        userUUID;
                    callback(error, false);
                } else {
                    var groupEntities = JSON.parse(response)['entities'];
                    
                    if (groupEntities.length > 0) {
                        var groupList = [];
                        for (var i = 0; i < groupEntities.length; i++) {
                            var groupItem = { name : groupEntities[i].path };
                            groupList.push(groupItem);
                        }
                        callback(null, groupList);
                    } else {
                        var error = new Error();
                        error.message = "User is not in any user groups.";
                        error.statusCode = 401;
                        callback(error, null);
                    }            
                }
            });            
        }
    });    
}

/**
 * Creates an "owners" API BaaS user group for the specified foodcart.
 * The user who creates the cart is automatically added to this
 * group.
 * 
 * Through a role and permissions assigned to this group, users in 
 * the group are able to update and delete the foodcart that corresponds
 * to the group.
 */
function createCartOwnerUserGroup (cartUUID, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error, null);
        } else {
        
            // Construct the group's path and title with the 
            // foodcart's UUID, ensuring the those values will be 
            // unique.
            var pathCartID = cartUUID.replace(/-/g, ".");            
            var groupPath = "foodcarts/" + pathCartID + "/owners";
            var groupTitle = "/foodcarts/" + cartUUID + "/owners";
            
            var body = {
                path : groupPath,
                title : groupTitle
            };
            
            endpointPath = "/groups" + '?access_token=' + dataStoreClientToken;
            var uri = host + appPath + endpointPath;
            
            console.log("Creating a user group for owners of a cart: " + uri);
        
            var options = {
                uri: uri,
                method: "POST",
                body: JSON.stringify(body)
            };
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    console.log(error);
                    error.message = "Unable to add owner group for that foodcart.";
                    callback(error, false);
                } else {
                    callback(null, JSON.parse(response));
                }
            });
        }
    });
    
}

/**
 * Deletes the "owners" API BaaS user group. This function would
 * be called when the foodcart is being deleted.
 */
function deleteCartOwnerUserGroup (cartUUID, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error);
        } else {
        
            var pathCartID = cartUUID.replace(/-/g, ".");
            
            var groupPath = "foodcarts/" + pathCartID + "/owners";            
            endpointPath = "/groups/" + groupPath + '?access_token=' + dataStoreClientToken;
            var uri = host + appPath + endpointPath;
            
            console.log("Deleting a user group for owners of a cart: " + uri);
        
            var options = {
                uri: uri,
                method: "DELETE"
            };
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    error.message = "Unable to delete owner group for that foodcart.";
                    callback(error, false);
                } else {
                    callback(null, JSON.parse(response));
                }
            });
        }
    });
}

/**
 * Applies security settings to the specified cart's owner user group.
 * 
 */
function secureCartOwnerUserGroup (cartUUID, groupPath, callback) {

    console.log("Securing a cart's owner user group: cart " + cartUUID + ", group " + groupPath);
    
    // Create the cart manager role that will include permissions
    // granting access to update and delete the cart.
    createCartManagerRole(cartUUID, function(error, response) {
        if (error) {
            callback(error, null);
        } else {
            var managerRoleName = response.name;
            
            // Assign the new manager role to the "owners" user
            // group so that the group's members have owner access.
            assignRoleToGroup(managerRoleName, groupPath, 
            function(error, response) {
                if (error) {
                    callback(error, null);
                } else {
                
                    // Create the menu manager role that will include
                    // permissions granting access to create, update, and 
                    // delete menu items and menus for this foodcart.
                    createMenuManagerRole(cartUUID, 
                        function(error, menuManagerResponse) {
                        if (error) {
                            callback(error, null);
                        } else {
                        
                            // Assign the new menu manager role to the 
                            // foodcart's "owners" group.
                            managerRoleName = menuManagerResponse.name;
                            var menuManagerRoleName = menuManagerResponse.name;
                            assignRoleToGroup(menuManagerRoleName, groupPath, 
                                function(error, response) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    callback(null, response);                                        
                                }
                            });
                        }                
                    });                                            
                }
            });
        }                
    });
}

/**
 * Creates the manager role for the specified foodcart. This role
 * includes permissions that allow users to update and delete 
 * the foodcart.
 */
function createCartManagerRole (cartUUID, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error);
        } else {
        
            var pathCartID = cartUUID.replace(/-/g, ".");
            
            var roleName = pathCartID + "-manager";
            var roleTitle = "/foodcarts/" + cartUUID + "/manager";
            
            var body = {
                name : roleName,
                title : roleTitle
            };
            
            endpointPath = "/roles" + '?access_token=' + dataStoreClientToken;
            var uri = host + appPath + endpointPath;
    
            console.log("Creating a cart manager role: " + uri);
        
            var options = {
                uri: uri,
                method: "POST",
                body: JSON.stringify(body)
            };
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    error.message = "Unable to add cart manager role for that foodcart.";
                    callback(error, false);
                } else {
                    
                    var role = JSON.parse(response).entities[0];
                    var roleUUID = role.uuid;
                    
                    // Permissions to set in API BaaS.
                    var permissionsList = { 
                        permissions: [
                            { permission : "get,put,post,delete:/foodcarts/" + cartUUID }
                        ]
                    };
                    
                    assignPermissionsToRole(roleUUID, permissionsList, 
                        function(error, response) {
                        if (error) {
                            callback(error, null);
                        } else {
                            callback(null, role);
                        }
                    });
                }
            });
        }
    });
}

/**
 * Deletes the roles that grant access for updating/deleting
 * foodcarts, menus, and menu items for the specified foodcart. 
 * For example, this is called when the foodcart is deleted. 
 */
function removeCartSecurity (cartUUID, callback) {

    console.log("Removing roles and permissions for cart: " + cartUUID);
    
    // Delete the role with permissions for the foodcart.
    deleteCartManagerRole(cartUUID, function(error, response) {
        if (error) {
            callback(error, null);
        } else {
            // Delete the role with permissions for the foodcart's
            // menus and menu items.
            deleteMenuManagerRole(cartUUID, 
                function(error, menuManagerResponse) {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, response);
                }
            });                                            
        }                
    });
}

/**
 * Delete the cart manager user role. This role would
 * contain permissions for changing and deleting 
 * information about a foodcart. This function would be 
 * called when the foodcart is being deleted.
 */
function deleteCartManagerRole (cartUUID, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error);
        } else {
        
            var pathCartID = cartUUID.replace(/-/g, ".");
            
            var roleName = pathCartID + "-manager";
            
            endpointPath = "/roles/" + roleName + '?access_token=' + dataStoreClientToken;
            var uri = host + appPath + endpointPath;
    
            console.log("Deleting a cart manager role: " + uri);
        
            var options = {
                uri: uri,
                method: "DELETE"
            };
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    error.message = "Unable to delete cart manager role for that foodcart.";
                    callback(error, false);
                } else {
                    var role = JSON.parse(response).entities[0];
                    callback(null, role);
                }
            });
        }
    });
}


/**
 * Creates an "owners" API BaaS user group for the specified foodcart.
 * The user who creates the cart is automatically added to this
 * group.
 * 
 * Through a role and permissions assigned to this group, users in 
 * the group are able to update and delete the foodcart that corresponds
 * to the group.
 */
function createMenuManagerUserGroup (cartUUID, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error, null);
        } else {
        
            // Construct the group's path and title with the 
            // foodcart's UUID, ensuring the those values will be 
            // unique.
            var pathCartID = cartUUID.replace(/-/g, ".");
            var groupPath = "foodcarts/" + pathCartID + "/managers/menus";
            var groupTitle = "/foodcarts/" + cartUUID + "/managers/menus";
            
            var body = {
                path : groupPath,
                title : groupTitle
            };
            
            endpointPath = "/groups" + '?access_token=' + dataStoreClientToken;
            var uri = host + appPath + endpointPath;
            
            console.log("Creating a user group for menu managers of a cart: " + uri);
        
            var options = {
                uri: uri,
                method: "POST",
                body: JSON.stringify(body)
            };
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    console.log(error);
                    error.message = "Unable to add menu manager group for that foodcart.";
                    callback(error, false);
                } else {
                    callback(null, JSON.parse(response));
                }
            });
        }
    });
    
}

/**
 * Deletes the "owners" API BaaS user group. This function would
 * be called when the foodcart is being deleted.
 */
function deleteMenuManagerUserGroup (cartUUID, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error);
        } else {
        
            var pathCartID = cartUUID.replace(/-/g, ".");
            
            var groupPath = "foodcarts/" + pathCartID + "/managers/menus";            
            endpointPath = "/groups/" + groupPath + '?access_token=' + dataStoreClientToken;
            var uri = host + appPath + endpointPath;
            
            console.log("Deleting a user group for menu managers of a cart: " + uri);
        
            var options = {
                uri: uri,
                method: "DELETE"
            };
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    error.message = "Unable to delete menu managers group for that foodcart.";
                    callback(error, false);
                } else {
                    callback(null, JSON.parse(response));
                }
            });
        }
    });
}

/**
 * Applies security settings to the specified cart's owner user group.
 * 
 */
function secureMenuManagerUserGroup (cartUUID, groupPath, callback) {

    console.log("Securing a cart's menu manager user group: cart " + 
        cartUUID + ", group " + groupPath);
    
    // Create the menu manager role that will include
    // permissions granting access to create, update, and 
    // delete menu items and menus for this foodcart.
    createMenuManagerRole(cartUUID, 
        function(error, menuManagerResponse) {
        if (error) {
            callback(error, null);
        } else {        
            // Assign the new menu manager role to the 
            // foodcart's "owners" group.
            managerRoleName = menuManagerResponse.name;
            var menuManagerRoleName = menuManagerResponse.name;
            assignRoleToGroup(menuManagerRoleName, groupPath, 
                function(error, response) {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, response);                                        
                }
            });
        }                
    });                                            
}

/**
 * Create the manager-menus user role for a foodcart. The
 * role will contain permissions that control access for
 * adding, changing, and deleting menu items and menus. 
 * This function would be called when a foodcart is 
 * being created.
 */
function createMenuManagerRole (cartUUID, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error);
        } else {
            
            // Construct the role's name using the foodcart's 
            // UUID to ensure its uniqueness.
             var pathCartID = cartUUID.replace(/-/g, ".");             
             var roleName = pathCartID + "-manager-menus";
             var roleTitle = "/foodcarts/" + cartUUID + "/managers/menus";
             
             var body = {
                 name : roleName,
                 title : roleTitle
             };
             
             endpointPath = "/roles" + '?access_token=' + dataStoreClientToken;
             var uri = host + appPath + endpointPath;
     
             console.log("Creating a menu manager role: " + uri);
         
             var options = {
                 uri: uri,
                 method: "POST",
                 body: JSON.stringify(body)
             };
             
             return makeRequest(options, function (error, response) {
                 if (error) {
                     error.message = "Unable to add menu manager role for that foodcart.";
                     callback(error, false);
                 } else {
                     
                     var role = JSON.parse(response).entities[0];
                     var roleName = role.name;
                     
                    // Permissions to set in API BaaS.
                     var permissionsList = {
                         permissions: [
                             { permission : "get,put,post,delete:/foodcarts/" + 
                                cartUUID + "/offers/*" },
                             { permission : "get,put,post,delete:/foodcarts/" + 
                                cartUUID + "/publishes/*" }
                         ]
                     };
                     // Assign these permissions to the new role.
                     assignPermissionsToRole(roleName, permissionsList, 
                         function(error, response) {
                         if (error) {
                             console.log(error);
                             callback(error, null);
                         } else {
                             callback(null, role);
                         }
                     });
                 }
             });
         }
    });
}

/**
 * Delete the menu-manager user role that contains permissions for
 * adding, changing, and deleting menu items and menus. This 
 * function would be called when a foodcart is being deleted.
 */
function deleteMenuManagerRole (cartUUID, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error);
        } else {
        
            var pathCartID = cartUUID.replace(/-/g, ".");
            var roleName = pathCartID + "-manager-menus";
            
            endpointPath = "/roles/" + roleName + 
                '?access_token=' + dataStoreClientToken;
            var uri = host + appPath + endpointPath;
    
            console.log("Deleting a menu manager role: " + uri);
        
            var options = {
                uri: uri,
                method: "DELETE"
            };
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    error.message = "Unable to delete menu manager role for that foodcart.";
                    callback(error, false);
                } else {                
                    callback(null, response);
                }
            });
        }
    });
}

/**
 * Adds permissions to a user role. For example, this function would be
 * called when a menu item is being added for a foodcart. The new permissions
 * would control access to the item, allowing PUT or DELETE access only to 
 * users in the role.
 */
function assignPermissionsToRole (roleName, permissionsList, callback) {

    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error);
        } else {
        
            endpointPath = "/roles/" + roleName + "/permissions";
            
            var uri = host + appPath + endpointPath + '?access_token=' + dataStoreClientToken;
            console.log("Assigning permissions to a role: " + uri);
    
            // Loop through the list of permissions, POSTing each to the specified
            // role in API BaaS.
            async.each(permissionsList.permissions, function(permission, callback) {
                var options = {
                    uri: uri,
                    method: "POST",
                    body: JSON.stringify(permission)
                };
                return makeRequest(options, function (error, response) {
                    if (error) {
                        error.message = "Unable to assign permissions to role.";
                        callback(error, false);
                    } else {
                        callback(null, JSON.parse(response));
                    }
                });
            }, function(error) {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, JSON.stringify(permissionsList));
                }
            });                
        }        
    });
}

/**
 * Removes permissions from a user role. For example, this function would 
 * be called when a menu item is being deleted in order to clean up
 * permission that controlled access to that item.
 */
function deletePermissionsFromRole (roleName, permissionsList, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error);
        } else {
        
            endpointPath = "/roles/" + roleName + "/permissions" + 
                '?access_token=' + dataStoreClientToken;
           
            // Loops through the list of permissions, deleting each permission
            // from the role in API BaaS.
            async.each(permissionsList.permissions, function(permission, callback) {
           
               var uri = host + appPath + endpointPath + "&permission=" + permission.permission;
               console.log("Deleting permissions from role: " + uri);
               
               var options = {
                   uri: uri,
                   method: "DELETE"
               };
               return makeRequest(options, function (error, response) {
                   if (error) {
                       error.message = "Unable to delete permissions from role.";
                       callback(error, false);
                   } else {
                       callback(null, JSON.parse(response));
                   }
               });
           }, function(error) {
               if (error) {
                   callback(error, null);
               } else {
                   callback(null, JSON.stringify(permissionsList));
               }
           });
           }
    });
}

/**
 * Assigns a user role to a user group. For example, this is 
 * used to assign a role with owner permissions to a foodcart
 * owners group.
 */
function assignRoleToGroup (roleName, groupPath, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {

        if (error) {
            console.log(error);
            callback(error);
        } else {
        
            endpointPath = "/roles/" + roleName + "/groups/" + groupPath + 
                '?access_token=' + dataStoreClientToken;
            var uri = host + appPath + endpointPath;
            
            console.log("Assigning a role to a group: " + uri);
            
            var options = {
                uri: uri,
                method: "POST"
            };
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    error.message = "Unable to assign role to group.";
                    callback(error, false);
                } else {
                    callback(null, JSON.parse(response));
                }
            });
        }
    });
}

/**
 * Adds the specified user to a BaaS user group. For example, this is 
 * called when adding a user to a cart owners group when creating
 * a foodcart. 
 */
function addUserToGroup (userUUID, groupPath, callback) {
    
    // Get an "application client" token to pass for authorization.
    // Making changes to user groups, roles, and permissions, should
    // only be done by the application, not a user account.
    getDataStoreClientToken( function(error, dataStoreClientToken) {
    
        if (error) {
            console.log(error);
            callback(error);
        } else {
        
            endpointPath = "/groups/" + groupPath + "/users/" + 
                userUUID + '?access_token=' + dataStoreClientToken;
            var uri = host + appPath + endpointPath;
            
            console.log("Adding a user to a group: " + uri);
            
            var options = {
                uri: uri,
                method: "POST"
            };
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    console.log(error);
                    error.message = "Unable to add person to the group.";
                    callback(error, false);
                } else {
                    var entity = JSON.parse(response);
                    streamlineResponseEntity(entity, function(streamlinedResponse){
                     callback(null, JSON.stringify(streamlinedResponse));
                    });
                }
            });
        }
    });
}

// General utility functions.

/**
 * Makes a request to the API BaaS data store API. All requests
 * are made through this function.
 */
function makeRequest(options, callback) {

    console.log("Making a data store API request: " + JSON.stringify(options));

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

/**
 * Authenticates with the API BaaS data store using the 
 * BaaS organization client ID and secret. This level
 * of authorization grants full access to BaaS features.
 */
function authenticateAsDataStoreClient(callback) {

    var orgVault = apigee.getVault(edgeVault, edgeVaultScope);

    orgVault.get(dataStoreIdEntry, function(error, idValue) {
        var clientID;
        var clientSecret;
        
        if (error) {
            callback(error);
        } else {
            clientID = idValue;
            orgVault.get(dataStoreSecretEntry, function(error, secretValue) {
                if (error) {
                    callback(error, null);
                } else {
                    clientSecret = secretValue;
                    
                    endpointPath = "/token";
                    var uri = host + appPath + endpointPath;
                
                    console.log("Authenticating as a data store client: " + uri);
                
                    var authBody = {
                        "grant_type" : "client_credentials",
                        "client_id" : clientID, 
                        "client_secret" : clientSecret
                    };
                
                    var options = {
                        uri: uri,
                        body: JSON.stringify(authBody),
                        method: "POST"
                    };
                    
                    return makeRequest(options, function (error, response) {
                        if (error) {
                            error.message = "Unable to authenticate as client.";
                            callback(error, null);
                        } else {
                            var clientToken = JSON.parse(response).access_token;
                            console.log('Client access token: ' + clientToken);
                            callback(null, clientToken);
                        }
                    });
                }
            });            
        }
    });    
}

/**
 * Gets an "application client" API BaaS auth token
 * for use in performing certain operations with the 
 * data store, including changes to user groups, roles,
 * and permissions.
 * 
 * This function is designed to get a token from the Edge
 * vault (secure store) and if there is no token there, 
 * it gets one by authenticating with BaaS. When authenticating,
 * the function uses the BaaS organization client ID and
 * secret, which were stored in the vault as a step in 
 * setting up StreetCarts. 
 * 
 * However, there currently appears to be no way to refresh
 * a vault entry using the apigee-access Node.js module (after 
 * a token is retrieved by authenticating), so this code just 
 * generates a token on each call.
 */
function getDataStoreClientToken(callback) {

    var orgVault = apigee.getVault(edgeVault, edgeVaultScope);

    orgVault.get(dataStoreTokenEntry, function(error, clientToken) {
        if (error) {
            callback(error);
        } else {
            if (clientToken === '')
            {
                authenticateAsDataStoreClient( function(error, authToken) {
                    if (error) {
                        callback(error, null);
                    } else {
                        clientToken = authToken;
                        callback(null, clientToken);
                    }
                });
            }    
        }
    });
}

/**
 * Removes unwanted properties from arrayed entity data returned by 
 * the data store.
 */
function streamlineResponseArray(entityArray, callback) {

    console.log("Streamlining a response array: " + JSON.stringify(entityArray));
    
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

/**
 * Removes unwanted properties from JSON returned by 
 * the data store. API BaaS responses contain several properties
 * that are probably not of interest (or not useful) to a client of 
 * the Edge-based StreetCarts API.
 * 
 * The properties removed here would be useful a client application
 * (and app developer) interacting directly with API BaaS.
 */
function streamlineResponseEntity(responseData, callback) {
    
    console.log("Streamlining a response entity: " + JSON.stringify(responseData));

    // The properties to remove from the JSON.
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
