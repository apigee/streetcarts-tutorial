var async = require('async');
var fs = require('fs');
var querystring = require('querystring');
var request = require('request');
var sleep = require('sleep');

// Parts of URL for accessing StreetCarts API.
//var orgName = 'apptraining';
//var envName = 'test';
//var domain = 'apigee.net';
//var appName = 'streetcarts';

module.exports = {

    createVaults: function (configOptions, callback) {
    
        var username = configOptions.username;
        var password = configOptions.password;
        var auth = "Basic " + new Buffer(username +
            ":" + password).toString("base64");
        
        var edgeConfig = configOptions.config.edge;
        var mgmtApiHost = edgeConfig.mgmtApiHost;
        
        var vaults = edgeConfig.vaults;
        
        if (vaults.length > 0) {
            
            async.each(vaults, function (vault, callback) {
            
                var vaultName = vault.name;
                var vaultScope = vault.scope;
                var vaultEntries = vault.entries;
                
                var uri = 'https://' + mgmtApiHost + '/v1/organizations/' + orgName + 
                    '/environments/' + envName + '/vaults';                    
                var vaultBody = {
                    "name": vaultName
                };
                
                var options = {
                    uri: uri,
                    body: JSON.stringify(vaultBody),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': auth
                    },
                    method: "POST"
                };
                return makeRequest(options, function (error, response) {
                    if (error) {
                        callback(error, null);
                    } else if (response.statusCode == 500) {
                        var responseBody = response.body;
                        var message = JSON.parse(responseBody).message;
                        var errorObject = new Error();
                        errorObject.message = message;
                        errorObject.statusCode = response.statusCode;
                        callback(errorObject, null);
                        
                    } else {
                        var responseBody = response.body;
                        console.log('\n\nCreated vault: ' + JSON.parse(responseBody).name);   
                        
                        if (vaultEntries.length > 0)
                        {
                            uri = 'https://' + mgmtApiHost + '/v1/organizations/' + 
                                orgName + '/environments/' + envName + '/vaults/' + 
                                vaultName + '/entries';
                            
                            async.each(vaultEntries, function (vaultEntry, callback) {
                            
                                var entryName = vaultEntry.name;
                                var entryValue = vaultEntry.value;
                                
                                var body = {
                                    "name": entryName,
                                    "value": entryValue
                                };
                                
                                var options = {
                                    uri: uri,
                                    body: JSON.stringify(body),
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': auth
                                    },
                                    method: "POST"
                                };
                                makeRequest(options, function (error, response) {
                                    if (error && error.statusCode != '201')
                                    {
                                        callback(error, null);
                                    } else {
                                        var responseBody = response.body;
                                        console.log('\n\nCreated vault entry.');
                                    }
                                });
                            },
                            function (error) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    callback(null, 'Added vault entries.');
                                }
                            });
                        }
                    }
                });
            },
            function (error) {
                if (error) {
                    callback(error, null);
                } else {
                    callback('Added vault entries.');
                }
            });
        } else {
            callback('No vaults information was included in the configuration file.');
        }
    },
    
    
    createBaasGroups: function (configOptions, callback) {

        var baasConfig = configOptions.config.apiBaaS;
        
        var clientId = baasConfig.clientCredentials.clientId;
        var clientSecret = baasConfig.clientCredentials.clientSecret;
        
        var apiBaaSHost = baasConfig.apiHost;
        var orgName = baasConfig.orgName;
        var appName = baasConfig.appName;
        
        if (baasConfig.groups && baasConfig.groups.length > 0)
        {
            var groups = baasConfig.groups;
            
            var uri = 'https://' + apiBaaSHost + '/' + orgName + '/' + appName + 
                '/groups?client_id=' + clientId + '&client_secret=' + clientSecret;
                
            async.each(groups, function (group, callback) {
                var title = group.title;
                var path = group.path;
                
                var groupBody = {
                    "path" : path,
                    "title" : title
                };
                
                var options = {
                    uri: uri,
                    body: JSON.stringify(groupBody),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: "POST"
                };
                return makeRequest(options, function (error, response) {
                    if (error && error.statusCode != '201')
                    {
                        callback(error, null);
                    } else if (response.statusCode == 400) {
                        var body = response.body;
                        var error = JSON.parse(body).error;
                        callback(error, null);
                    } else {
                        var body = response.body;
                        var entities = JSON.parse(body).entities;
                        var groupPath = entities[0].path;
                        console.log('\n\nCreated group: ' + groupPath);
                        callback(null, response);                        
                    }
                });
            },
            function (error) {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, 'Added groups.');
                }
            });
        }        
    },
    
    
    createBaasRoles: function (configOptions, callback) {
       
        var baasConfig = configOptions.config.apiBaaS;
        
        var clientId = baasConfig.clientCredentials.clientId;
        var clientSecret = baasConfig.clientCredentials.clientSecret;
        
        var apiBaaSHost = baasConfig.apiHost;
        var orgName = baasConfig.orgName;
        var appName = baasConfig.appName;
        
        if (baasConfig.roles && baasConfig.roles.length > 0)
        {
            var roles = baasConfig.roles;
            
            var uri = 'https://' + apiBaaSHost + '/' + orgName + '/' + appName + 
                '/roles?client_id=' + clientId + '&client_secret=' + clientSecret;
                
            async.each(roles, function (role, callback) {
                var roleTitle = role.title;
                var roleName = role.name;
                
                var roleBody = {
                    "name" : roleName,
                    "title" : roleTitle
                };
                
                var options = {
                    uri: uri,
                    body: JSON.stringify(roleBody),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: "POST"
                };
                return makeRequest(options, function (error, response) {
                    if (error)
                    {
                        callback(error, null);
                    } else {
                        var body = response.body;
                        var entities = JSON.parse(body).entities;
                        var roleName = entities[0].name;
                        console.log('\n\nCreated ' + roleName + ' role.');      

                        if (role.permissions && (role.permissions.length > 0)) {
                            var permissions = role.permissions;
                            
                            async.each(permissions, function (permission, callback) {
                            
                                var uri = 'https://' + apiBaaSHost + '/' + orgName + 
                                    '/' + appName + '/roles/' + roleName + 
                                    '/permissions?client_id=' + clientId +
                                    '&client_secret=' + clientSecret;

                                var verbs = permission.verbs;
                                var path = permission.path;
                                
                                var permissionsBody = { 
                                    "permission" : verbs + ':' + path
                                };
                                
                                var options = {
                                    uri: uri,
                                    body: JSON.stringify(permissionsBody),
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    method: "POST"
                                };
                                return makeRequest(options, function (error, response) {
                                    if (error && error.statusCode != '200')
                                    {
                                        callback(error, null);
                                    } else {
                                        var body = response.body;
                                        var data = JSON.parse(body).data;    
                                        callback(null, response);
                                    }
                                });
                            }, 
                            
                            function (error) {
                                if (error) { 
                                    callback(error, null);                                    
                                } else {
                                    console.log('\n\nAdded permissions for ' + 
                                    roleName + ' role');                 
                                    callback(null, 'Added ' + roleName +  'role.');
                                }
                            });
                        }
                    }
                });
            },
            function (error) {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, 'Added roles.');
                }
            });
        }        
    },
    
    
    assignBaasRolesToGroups: function (configOptions, callback) {
    
        var baasConfig = configOptions.config.apiBaaS;
        var clientId = baasConfig.clientCredentials.clientId;
        var clientSecret = baasConfig.clientCredentials.clientSecret;
        var apiBaaSHost = baasConfig.apiHost;
        var orgName = baasConfig.orgName;
        var appName = baasConfig.appName;
        var groups = baasConfig.groups;
                
        async.each(groups, function (group, callback) {
            var groupPath = group.path;
            var roles = group.roles;
            
            if (group.roles && (group.roles.length > 0)) {
                
                async.each(roles, function (role, callback) {
                    var roleName = role.name;
                    
                    var uri = 'https://' + apiBaaSHost + '/' + orgName + '/' + appName + 
                        '/roles/' + roleName + '/groups/' + groupPath + '?client_id=' +
                            clientId + '&client_secret=' + clientSecret;
    
                    var options = {
                        uri: uri,
                        method: "POST"
                    };
                    return makeRequest(options, function (error, response) {
                        if (error && (error.statusCode != '201') && 
                            (error.statusCode != '200'))
                        {
                            callback(error, null);
                        } else {
                            var body = response.body;
                            var entities = JSON.parse(body).entities;    
                            console.log('\n\nAssigned ' + entities[0].path + ' role to group.' );                        
                            callback(null, response);
                        }
                    });
                },
                function (error) {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback(null, 'Assigned roles to groups.');
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
}

function makeRequest(options, callback) {
    
    sleep.sleep(1);
    
    request(options, function (error, response) {
       
        var errorObject = new Error();
        
        if (error) {
            errorObject.message = error.message;
            errorObject.statusCode = error.statusCode;
            callback(errorObject, null);
        } else {
            callback(null, response);
        }
    });
}