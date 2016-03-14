var async = require('async');
var fs = require('fs');
var querystring = require('querystring');
var request = require('request');
var sleep = require('sleep');

module.exports = {

    createVaults: function (configOptions, callback) {
    
        var auth = configOptions.auth;
        var edgeConfig = configOptions.config.edge;
        var mgmtApiHost = edgeConfig.mgmtApiHost;
        var orgName = edgeConfig.orgName;
        var envName = edgeConfig.envName;
        
        var vaults = edgeConfig.vaults;
        
        if (vaults.length > 0) {
            
            async.each(vaults, function (vault, callback) {
            
                var vaultName = vault.name;
                var vaultScope = vault.scope;
                var vaultEntries = vault.entries;

                var uri = 'https://' + mgmtApiHost + '/v1/organizations/' + orgName + 
                    '/environments/' + envName + '/vaults/' + vaultName;                    
                
                var options = {
                    uri: uri,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': auth
                    },
                    method: "DELETE"
                };
                // To keep things clean, delete the vault if it's there.
                deleteVault(vaultName, options, function(error, response){
                    if (error) {
                        callback(error, null);
                    } else {                        
                        uri = 'https://' + mgmtApiHost + '/v1/organizations/' + orgName + 
                            '/environments/' + envName + '/vaults';

                        var vaultBody = {
                            "name": vaultName
                        };
                        
                        options = {
                            uri: uri,
                            body: JSON.stringify(vaultBody),
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': auth
                            },
                            method: "POST"
                        };
                        
                        console.log('\nCreating vault: ' + vaultName);

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
                                        
                                        console.log('\nAdding vault entry: ' + entryName);
                                        
                                        makeRequest(options, function (error, response) {
                                            if (error && error.statusCode != '201')
                                            {
                                                callback(error, null);
                                            } else {
                                                var responseBody = response.body;
                                                callback(null, responseBody);
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
        } else {
            callback('No vaults information was included in the configuration file.', null);
        }
    },

    createBaasCollections: function (configOptions, callback) {

        var baasConfig = configOptions.config.apiBaaS;
        
        var clientId = baasConfig.clientCredentials.clientId;
        var clientSecret = baasConfig.clientCredentials.clientSecret;
        
        var apiBaaSHost = baasConfig.apiHost;
        var orgName = baasConfig.orgName;
        var appName = baasConfig.appName;
        
        if (baasConfig.collections && baasConfig.collections.length > 0)
        {
            var collections = baasConfig.collections;
            
            async.each(collections, function (collection, callback) {
                var collectionName = collection.name;
                
                var uri = 'https://' + apiBaaSHost + '/' + orgName + '/' + appName + '/' +
                collectionName + '?client_id=' + clientId + '&client_secret=' + clientSecret;
                
                var options = {
                    uri: uri,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: "POST"
                };
                console.log('\nCreating collection: ' + collectionName);
                return makeRequest(options, function (error, response) {
                    if (error && error.statusCode != '201')
                    {
                        callback(error, null);
                    } else if (response.statusCode == 400) {
                        var body = response.body;
                        var error = JSON.parse(body).error;
                        callback(error, null);
                    } else {
                        var body = JSON.parse(response.body);
                        callback(null, response);                        
                    }
                });                
            },
            function (error) {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, 'Added collections.');
                }
            });
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
            
            async.each(groups, function (group, callback) {
                var title = group.title;
                var path = group.path;
                
                var uri = 'https://' + apiBaaSHost + '/' + orgName + '/' + appName + 
                '/groups/' + path + '?client_id=' + clientId + '&client_secret=' + clientSecret;
                
                // To keep things clean, delete the group if it's there.
                deleteGroup(path, uri, function(error, response){
                    if (error) {
                        callback(error, null);
                    } else {
                        var groupBody = {
                            "path" : path,
                            "title" : title
                        };
                        
                        var uri = 'https://' + apiBaaSHost + '/' + orgName + '/' + appName + 
                            '/groups?client_id=' + clientId + '&client_secret=' + clientSecret;
                            
                        var options = {
                            uri: uri,
                            body: JSON.stringify(groupBody),
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            method: "POST"
                        };
                        console.log('\nCreating group: ' + path);
                        return makeRequest(options, function (error, response) {
                            if (error && error.statusCode != '201')
                            {
                                callback(error, null);
                            } else if (response.statusCode == 400) {
                                var body = response.body;
                                var error = JSON.parse(body).error;
                                callback(error, null);
                            } else {
                                var body = JSON.parse(response.body);
                                var entities = body.entities;
                                var groupPath = entities[0].path;
                                callback(null, response);                        
                            }
                        });
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
    
    /**
     * Create roles and permissions in API BaaS according to 
     * roles defined in the config file.
     */
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
            
            async.each(roles, function (role, callback) {
                var roleTitle = role.title;
                var roleName = role.name;
                
                var uri = 'https://' + apiBaaSHost + '/' + orgName + '/' + appName + 
                '/roles/' + roleName + '?client_id=' + clientId + '&client_secret=' + clientSecret;
                
                // To keep things clean, delete the role if it's there.
                deleteRole(roleName, uri, function(error, response){
                        if (error)
                        {
                            callback(error, null);
                        } else {
                        var roleBody = {
                            "name" : roleName,
                            "title" : roleTitle
                        };
                        
                        // Now create the new role from the config file.
                        uri = 'https://' + apiBaaSHost + '/' + orgName + '/' + appName + 
                            '/roles?client_id=' + clientId + '&client_secret=' + clientSecret;
                        
                        var options = {
                            uri: uri,
                            body: JSON.stringify(roleBody),
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            method: "POST"
                        };
                        console.log('\nCreating role: ' + roleName);      
                        return makeRequest(options, function (error, response) {
                            if (error)
                            {
                                callback(error, null);
                                process.exit();
                            } else {
                                var body = JSON.parse(response.body);
                                var entities = body.entities;
                                var roleName = entities[0].name;
        
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
                                                process.exit();
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
                                            callback(null, 'Added role: ' + roleName);
                                        }
                                    });
                                }
                            }
                        });
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
                    console.log('\nAssigning ' + roleName + ' role to ' + 
                        groupPath + ' group.' );
                    return makeRequest(options, function (error, response) {
                        if (error && (error.statusCode != '201') && 
                            (error.statusCode != '200'))
                        {
                            callback(error, null);
                            process.exit();
                        } else {
                            var body = response.body;
                            var entities = JSON.parse(body).entities;    
          
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

function deleteGroup(groupName, uri, callback) {
    
    var options = {
        uri: uri,
        headers: {
            'Content-Type': 'application/json'
        },
        method: "DELETE"
    };
    console.log('\nDeleting group: ' + groupName)
    return makeRequest(options, function (error, response) {
        if (error)
        {
            if (error.statusCode !== 404){
                callback(error, null);
            } else {
                callback();
            }
        } else {
            callback(null, response);
        }
    });
}

function deleteRole(roleName, uri, callback) {
    
    var options = {
        uri: uri,
        headers: {
            'Content-Type': 'application/json'
        },
        method: "DELETE"
    };
    console.log('\nDeleting role: ' + roleName)
    return makeRequest(options, function (error, response) {
        if (error)
        {
            if (error.statusCode !== 404){
                callback(error, null);
            } else {
                callback();
            }
        } else {
            callback(null, response);
        }
    });
}

function deleteVault(vaultName, options, callback) {
    
    console.log('\nDeleting vault: ' + vaultName)
    return makeRequest(options, function (error, response) {
        if (error)
        {
            if (error.statusCode !== 500)
            {
                callback(error, null);                
            } else {
                callback();
            }
        } else {
            callback(null, response);
        }
    });
}

function makeRequest(options, callback) {
    
    sleep.sleep(1);
    
    request(options, function (error, response) {
        var errorObject = new Error();
        
        if (error) {
            console.log('\nRequest: ' + options.method + ' ' + options.uri);
            console.log('Status code: ' + response.statusCode);
            
            errorObject.message = error.message;
            errorObject.statusCode = error.statusCode;
            callback(errorObject, null);
        } else if (response.statusCode !== 200 && response.statusCode !== 201) {
            console.log('\nRequest: ' + options.method + ' ' + options.uri);
            console.log('Status code: ' + response.statusCode);
            
            var bodyObj = JSON.parse(response.body);
            if (bodyObj.fault) {
                var fault = bodyObj.fault;
                errorObject.message = fault.faultstring;
            } else if (response.statusMessage) {
                errorObject.message = response.statusMessage;
            }
            errorObject.statusCode = response.statusCode;
            callback(errorObject, null);
        } else {            
            console.log('\nRequest: ' + options.method + ' ' + options.uri);
            console.log('Status code: ' + response.statusCode);
            console.log('Response body: ' + response.body);
            
            if (response.body) {
                var callbackResponse;
                try {
                    var bodyObj = JSON.parse(response.body);
                    callbackResponse = bodyObject
                    callback(null, bodyObj);                    
                } catch (exception) {
                    callback(null, response);                    
                }
            }
        }
    });
}