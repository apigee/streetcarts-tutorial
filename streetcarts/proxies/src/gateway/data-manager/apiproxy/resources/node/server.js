var dataManager = require('./data-manager');
var express = require('express');
var cors = require('cors');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
// support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());
// support encoded bodies

// Free public APIs

app.get('/carts', function (req, res) {
    console.log('/carts');
    dataManager.getCartList('', function (error, data) {
        var expand = req.query.expand;
        
        if (error) {
            res.send(error);
        }
        if (data) {
            if (expand !== undefined && expand == 'true') {
                res.set('Content-Type', 'application/json');
                res.send(data);
            } else {
                
                var jsonData = JSON.parse(data);
                var cartdata = {
                    cartinfo:[]
                };
                
                for (var i = 0; i < jsonData.carts.length; i++) {
                    cartdata.cartinfo.push({
                        "name": jsonData.carts[i].name,
                        "uuid": jsonData.carts[i].uuid,
                        "city": jsonData.carts[i].location.city
                    });
                }
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(cartdata));
            }
        }
    });
});

app.get('/carts/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/carts/' + uuid);
    dataManager.getCart(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/carts/:uuid/menus', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/carts/' + uuid + '/menus');
    dataManager.getMenusForCart(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/items/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/items/' + uuid);
    dataManager.getDetailsForItem(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/menus', function (req, res) {
    console.log('/menus');
    dataManager.getMenuList('', function (error, data) {
        var expand = req.query.expand;
        
        if (error) {
            res.send(error);
        }
        if (data) {
            if (expand !== undefined && expand == 'true') {
                res.set('Content-Type', 'application/json');
                res.send(data);
            } else {
                var jsonData = JSON.parse(data);
                var menudata = {
                    menuinfo:[]
                };
                
                for (var i = 0; i < jsonData.menus.length; i++) {
                    menudata.menuinfo.push({
                        "uuid": jsonData.menus[i].uuid,
                        "menuName": jsonData.menus[i].menuName,
                        "cartName": jsonData.menus[i].cartName
                    });
                }
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(menudata));
            }
        }
    });
});

app.get('/menus/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/menus/' + uuid);
    dataManager.getMenu(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/menus/:uuid/items', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/menus/' + uuid + '/items');
    dataManager.getItemsForMenu(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/menus/:menu_uuid/items/:item_uuid', function (req, res) {
    var item_uuid = req.params.item_uuid;
    console.log('/items/' + item_uuid);
    dataManager.getDetailsForItem(item_uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/users/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/users/' + uuid);
    dataManager.getUser(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});


//*** APIs for registered cart owners.

app.get('/users/:uuid/carts', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/users/' + uuid + '/carts');
    dataManager.getCartsOwnedByUser(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/carts/:uuid/items', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/users/' + uuid + '/carts');
    dataManager.getItemsForCart(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/carts/:uuid/items', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/carts/' + uuid + '/items');
    var itemData = req.body;
    dataManager.addNewItem(itemData, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/carts/:uuid/menus', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/carts/' + uuid + '/menus');
    var menuData = req.body;
    dataManager.addNewMenu(menuData, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/menus/:menu_uuid/items/:item_uuid', function (req, res) {
    var args = {
        "menu_uuid": req.params.menu_uuid,
        "item_uuid": req.params.item_uuid
    };
    console.log('/menus/' + req.params.menu_uuid + '/items/' + req.params.item_uuid);
    dataManager.addItemToMenu(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.put('/menus/:menu_uuid/items/:item_uuid', function (req, res) {
    var args = {
        "item_uuid": req.params.item_uuid,
        "menu_uuid": req.params.menu_uuid,
        "new_values": req.body
    };
    console.log('/menus/' + req.params.menu_uuid + '/items/' + req.params.item_uuid);
    console.log(req.body);
    dataManager.updateDetailsForItem(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});


app.delete('/menus/:menu_uuid/items/:item_uuid', function (req, res) {
    var args = {
        "menu_uuid": req.params.menu_uuid,
        "item_uuid": req.params.item_uuid
    };
    console.log('/menus/' + req.params.menu_uuid + '/items/' + req.params.item_uuid);
    dataManager.removeItemFromMenu(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/users', function (req, res) {
    
    var username = req.body.username;
    var password = req.body.password;
    console.log('/users' + req.body);
    var email, city;
    if (req.body.email) {
        email = req.body.email;
    } else {
        email = "Not Given";
    }
    if (req.body.city) {
        city = req.body.city;
    } else {
        city = "Not Given";
    }
    
    var userdata = {
        "username": username, 
        "password": password, 
        "email": email, 
        "city": city
    };
    
    
    dataManager.registerUser(userdata, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.get('/users', function (req, res) {
    dataManager.getUserList('', function (error, data) {
        var expand = req.query.expand;
        
        if (error) {
            res.send(error);
        }
        if (data) {
            if (expand !== undefined && expand == 'true') {
                res.set('Content-Type', 'application/json');
                res.send(data);
            } else {
                
                var jsonData = JSON.parse(data);
                var userdata = {
                    userinfo:[]
                };
                
                for (var i = 0; i < jsonData.users.length; i++) {
                    userdata.userinfo.push({
                        "username": jsonData.users[i].username,
                        "uuid": jsonData.users[i].uuid,
                        "email": jsonData.users[i].email
                    });
                }
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(userdata));
            }
        }
    });
});


app.delete('/users/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/users/' + uuid);
    dataManager.deleteUser(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Example app listening at http://%s:%s', host, port);
});
