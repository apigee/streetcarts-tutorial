var dataManager = require('./data-manager');
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
// support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));
// support encoded bodies

// Free public APIs

app.get('/carts', function (req, res) {
    console.log('/carts');
    dataManager.getAllCarts('', function (error, data) {
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
                
                for (var i = 0; i < jsonData.entities.length; i++) {
                    cartdata.cartinfo.push({
                        "name": jsonData.entities[i].name,
                        "uuid": jsonData.entities[i].uuid,
                        "city": jsonData.entities[i].location.city
                    });
                }
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(cartdata));
            }
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
    console.log('/menus/' + uuid + 'items');
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

//*** APIs for registered cart owners.

app.get('/users/:uuid/carts', function (req, res) {
    //var uuid = "4ab08a6a-6d16-11e5-817d-a9b5da1cd192";
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

app.post('/carts/:uuid/items', function (req, res) {
    var uuid = req.params.uuid;
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

app.delete('/menus/:menu_uuid/items/:item_uuid', function (req, res) {
    var args = {
        "menu_uuid": req.params.menu_uuid,
        "item_uuid": req.params.item_uuid
    };
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
        "username": username, "password": password, "email": email, "city": city
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






var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Example app listening at http://%s:%s', host, port);
});
