var async = require('async');
var fs = require('fs');
var querystring = require('querystring');
var request = require('request');
var sleep = require('sleep');
var apigeeAppConfig = require('./apigee-app-config');

// Edge app
var orgName = 'apptraining';
var envName = 'test';
var domain = 'apigee.net';
var appName = 'streetcarts';
var appUri = 'http://' + orgName + '-' + envName + '.' + domain +
'/v1/' + appName;

var publicConsumerKey = 'bHOUh8zBd8h4vWrlnICboGWMSSi7BrNc';
var ownerConsumerKey = 'RygpMXewL4GhAqGeRjmE3bgLjzYtIOTH';
var ownerConsumerSecret = 'LB1KVd6qqeJ2G6fw';


var args = process.argv;

if (args[2] === 'configure-edge') {

    fs.readFile(args[3], 'utf8', function (error, data) {
        if (error) {
            console.log('\n\nGot read file error: \n' + error);            
        } else {
            var apigeeConfig = JSON.parse(data);
            var edgeConfig = apigeeConfig.edge;
            
            // create vault and entries
            if (edgeConfig.vaults) {
                var options = {
                    "username": args[4],
                    "password": args[5],
                    "config": apigeeConfig
                };
                
                apigeeAppConfig.createVaults(options, function (error, response) {
                    if (error && (error.statusCode != '201')) {
                        console.log('\n\nGot create vault error: \n' + JSON.stringify(error));
                    } else {
                        return console.log('\n\nVaults created: ' + '\n' + response);
                    }
                });                
            }            
        }
    });    
    
} else if (args[2] === 'configure-baas') {

    fs.readFile(args[3], 'utf8', function (error, data) {
        if (error) {
            console.log('\n\nGot read file error: \n' + error);            
        } else {
            var apigeeConfig = JSON.parse(data);
            var baasConfig = apigeeConfig.apiBaaS;
            
            if (baasConfig.roles) {
                var options = {
                    "config": apigeeConfig
                };                            
                apigeeAppConfig.createBaasRoles(options, function (error, response) {
                    if (error) {
                        console.log('\n\nGot create roles error: \n' + JSON.stringify(error));
                    } else {
                        console.log('\n\nRoles created.');
                    }
                });
            }
            if (baasConfig.groups) {
                var options = {
                    "config": apigeeConfig
                };
                apigeeAppConfig.createBaasGroups(options, function (error, response) {
                    if (error) {
                        console.log('\n\nError while creating API BaaS groups: \n' + 
                            error);
                    } else {
                        console.log('\n\nBaaS user groups created.');
                        async.each(baasConfig.groups, function (group, callback) {
                            if (group.roles) {
                                var options = {
                                    "config": apigeeConfig
                                };
                                apigeeAppConfig.assignBaasRolesToGroups(options, 
                                    function (error, response) {
                                    if (error) {
                                        console.log('\n\nError while assigning roles to groups: \n' + 
                                            JSON.stringify(error));
                                    } else {
                                        console.log('\n\nAssigned roles to groups.');
                                    }
                                });
                            }
                        },
                        function (error) {
                            if (error) {
                                callback(error, null);
                            } else {
                                callback(null, 'Added groups.');
                            }
                        });                        
                    }
                });
            }
        }
    });
} else if (args[2] === 'register-users') {
    
    var userDataFilePath = args[3];
    
    fs.readFile(userDataFilePath, 'utf8', function (error, data) {
        if (error) {
            console.log('\n\nGot read file error: \n' + error);
        } else {
            var userData = JSON.parse(data);
            createUserAccounts(userData, function (error, response) {
                if (error) {
                    console.log('\n\nError creating user account: \n' + error);
                } else {
                    return console.log('\n\nUser accounts created.');
                }
            });
        }
    });
} else if (args[2] === 'create-foodcarts') {
    
    var foodcartDataFilePath = args[3];
    var userDataFilePath = args[4];
    
    fs.readFile(foodcartDataFilePath, 'utf8', function (error, foodcartsData) {
        if (error) {
            console.log('\n\nError reading foodcart data file: \n' + error);
        } else {
            // Got the foodcart data.
            var foodcartsData = JSON.parse(foodcartsData);
            
            fs.readFile(userDataFilePath, 'utf8', function (error, usersData) {
                if (error) {
                    console.log('\n\nError reading user data file: \n' + error);
                } else {
                    var usersData = JSON.parse(usersData);
                    
                    createFoodcarts(foodcartsData, usersData, function (error, response) {
                        if (error) {
                            console.log('\n\nError creating foodcart: \n' + 
                                error);
                        } else {
                            return console.log('Foodcarts created');
                        }
                    });
                }
            });
        }
    });
} else {

    // Display help text.
    
    process.exit();
}

function createUserAccounts(usersData, callback) {
    
    endpointPath = '/users';
    var uri = appUri + endpointPath;
    
    if (usersData.length > 0) {
        
        async.each(usersData, function (userData, callback) {
            var user = JSON.stringify(userData);
            console.log('\n\nAttempting to create user ' + userData.username);
            var options = {
                uri: uri,
                body: user,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': publicConsumerKey
                },
                method: "POST"
            };
            return makeRequest(options, function (error, response) {
                var responseObject = JSON.parse(response);
                if (error) {
                    callback(error, null);
                } else if (responseObject.statusCode === 400) {
                    var errorObject = new Error();
                    errorObject.message = responseObject.message;
                    errorObject.statusCode = responseObject.statusCode;
                    errorObject.errorType = responseObject.errorType;
                    callback(errorObject, null);
                } else {
                    console.log('\n\nCreated user account: ' + responseObject.username);
                    callback(null, responseObject);
                }
            });
        },
        function (error) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, 'Added users');
            }
        });
    } else {
        callback('No data about users was provided.');
    }
}

/**
 * - import foodcarts JSON
 * - for each foodcart in the JSON, log in as a different
 * user, then add the cart
 */
function createFoodcarts(foodcartsData, usersData, callback) {
    console.log('\n\n\Creating foodcarts.');
    endpointPath = '/foodcarts';
    var uri = appUri + endpointPath;
    
    if (foodcartsData.foodcarts.length > 0) {
        
        async.forEachOf(foodcartsData.foodcarts, function (foodcartData, key, callback) {
            var foodcart = JSON.stringify(foodcartData);
            
            // grab a user and log in to get a token
            var userData = usersData[key];
            var username = userData.username;
            var password = userData.password;
            
            // send to function authenticate
            authenticateUser(username, password, function (error, response) {
                if (error) {
                    console.log('\n\nGot error while authenticating during foodcart creation: ' +
                    error);
                    callback(error);
                } else {
                    var access_token = response;
                    
                    var foodcartEntity = JSON.parse(foodcart);
                    var itemsData = foodcartEntity.items;
                    var menusData = foodcartEntity.menus;
                    
                    delete foodcartEntity.items;
                    delete foodcartEntity.menus;
                    
                    var options = {
                        uri: uri,
                        body: JSON.stringify(foodcartEntity),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + access_token
                        },
                        method: "POST"
                    };
                    
                    makeRequest(options, function (error, response) {
                        if (error) {
                            console.log('\n\nError creating foodcart: \n' + 
                                JSON.stringify(error));
                            callback(error, null);
                            process.exit(1);
                        } else {
                            var foodcart = JSON.parse(response);
                            console.log('\n\nCreated foodcart: ' +
                                foodcart.name);
                            
                            var foodcartUUID = foodcart.uuid;
                            
                            // Reuse the options object because it has the 
                            // token in it.
                            createItemsForFoodcart(foodcartUUID, itemsData, options,
                            function (error, itemsResponse) {
                                
                                if (error) {
                                    console.log('\n\nError creating an item: \n' + 
                                        JSON.stringify(error));
                                    callback(error, null);
                                } else {
                                    var itemsUUIDs = itemsResponse;
                                    
                                    createMenusForFoodcart(foodcartUUID, menusData, options,
                                    function (error, menusResponse) {
                                        if (error) {
                                            callback(error);
                                        } else {
                                            var menusUUIDs = menusResponse;
                                            addItemsToMenu(menusUUIDs[0], itemsUUIDs, options,
                                            function (error, response) {
                                                if (error) {
                                                } else {
                                                    callback(response);
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
        function (error) {
            if (error) {
                callback(error, null);
            } else {
                callback('Added foodcarts.');
            }
        });
    } else {
        callback('No data about foodcarts was provided.');
    }
}

/**
 */
function createItemsForFoodcart(foodcartUUID, itemsData, options, callback) {
    console.log('\n\nCreating menu items.');

    endpointPath = '/foodcarts/' + foodcartUUID + '/items';
    var uri = appUri + endpointPath;
    
    var itemsUUIDs = [];
    
    if (itemsData.length > 0) {
        
        async.each(itemsData, function (itemData, callback) {
            var item = JSON.stringify(itemData);
            
            options.uri = uri;
            options.body = item;
            
            makeRequest(options, function (error, response) {
                if (error) {
                    callback(error, null);
                } else {
                    var item = JSON.parse(response);
                    console.log('\n\nCreated item: ' + item.itemName);
                    itemsUUIDs.push(item.uuid);
                    callback();
                }
            });
        },
        function (error) {
            if (error) {
                callback(error, null);
            } else {                
                callback(null, itemsUUIDs);
            }
        });
    } else {
        callback('No data about items was provided.');
    }
}

/**
 * - log in as a user
 * - create a menu for the foodcart
 * - add items the cart owns to the menu
 */
function createMenusForFoodcart(foodcartUUID, menusData, options, callback) {
    console.log('\n\nCreating menus.');
    
    endpointPath = '/foodcarts/' + foodcartUUID + '/menus';
    var uri = appUri + endpointPath;
    
    var menusUUIDs =[];
    
    if (menusData.length > 0) {
        
        async.each(menusData, function (menuData, callback) {
            
            var menu = JSON.stringify(menuData);
                        
            options.uri = uri;
            options.body = menu;
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    console.log('\n\nError creating menu: \n' + JSON.stringify(error));
                    callback(error, null);
                } else {
                    var menu = JSON.parse(response);
                    console.log('\n\nCreated menu: ' + menu.menuName);
                    menusUUIDs.push(menu.uuid);
                    callback();
                }
            });
        },
        function (error) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, menusUUIDs);
            }
        });
    } else {
        callback('No data about menus was provided.');
    }
}

/**
 */
function addItemsToMenu(menuUUID, itemsUUIDs, options, callback) {

    endpointPath = '/menus/' + menuUUID + '/items/';
    
    if (itemsUUIDs.length > 0) {
        
        async.each(itemsUUIDs, function (itemUUID, callback) {
            
            var uri = appUri + endpointPath + itemUUID;
            
            options.uri = uri;
            options.method = 'PUT';
            delete options.body;
            
            return makeRequest(options, function (error, response) {
                if (error) {
                    callback(error, null);
                } else {
                    item = JSON.parse(response);
                    console.log('\n\nAdded item to menu: ' + JSON.parse(response).itemName);
                    callback();
                }
            });
        },
        function (error) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, menuUUID);
            }
        });
    } else {
        callback('No data about menus was provided.');
    }
}

function authenticateUser(username, password, callback) {
    
    endpointPath = '/accesstoken';
    var uri = appUri + endpointPath;
    
    var auth = "Basic " + new Buffer(ownerConsumerKey +
    ":" + ownerConsumerSecret).toString("base64");
    
    var form = {
        username: username,
        password: password,
        grant_type: 'password'
    };
    
    var formData = querystring.stringify(form);
    var contentLength = formData.length;
    
    var options = {
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': auth,
            'x-api-key': publicConsumerKey
        },
        uri: uri,
        body: formData,
        method: 'POST'
    };
    return makeRequest(options, function (error, response) {
        if (error) {
            callback(error, null);
        } else {
            var access_token = JSON.parse(response).access_token;
            callback(null, access_token);
        }
    });
}

function makeRequest(options, callback) {

    // Slow the pace of requests to avoid having the 
    // StreetCarts spike arrest shut down access.
    sleep.sleep(1);
    
    request(options, function (error, response, body) {
        
        var errorObject = new Error();
        
        if (error) {
            callback(errorObject, null);
        } else if (response) {
            callback(null, body);
        }
    });
}