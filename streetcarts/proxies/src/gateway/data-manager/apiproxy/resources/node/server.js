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
    var args = {
        "item_uuid": req.params.item_uuid,
        "menu_uuid": req.params.menu_uuid
    };
    dataManager.getDetailsForItemInMenu(args, function (error, data) {
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

app.post('/carts/:uuid/reviews', function (req, res) {
    var uuid = req.params.uuid;
    var reviewData = req.body;
    var args = {
        "cartID": uuid,
        "new_values": reviewData
    };
    console.log('/carts/' + uuid + '/reviews');

    dataManager.addNewReview(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});
app.get('/reviews/:uuid', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/reviews/' + uuid);
    dataManager.getDetailsForReview(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});
app.get('/carts/:uuid/reviews', function (req, res) {
    var uuid = req.params.uuid;
    console.log('/carts/' + uuid + '/reviews');
    dataManager.getReviewsForCart(uuid, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});
app.delete('/reviews/:uuid', function (req, res) {

    var reviewUUID = req.params.uuid;
    
    console.log('/reviews/' + reviewUUID);

    dataManager.deleteReview(reviewUUID, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});
app.put('/reviews/:uuid', function (req, res) {
    var args = {
        "review_uuid": req.params.uuid,
        "new_values": req.body
    };
    console.log('/reviews/' + req.params.uuid);

    dataManager.updateDetailsForReview(args, function (error, data) {
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

app.post('/carts', function (req, res) {
    var args = {
        "new_values": req.body
    };
    console.log('/carts');

    dataManager.addNewCart(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.put('/carts/:uuid', function (req, res) {
    var args = {
        "cart_uuid": req.params.uuid,
        "new_values": req.body
    };
    console.log('/carts/' + req.params.uuid);

    dataManager.updateDetailsForCart(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

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

app.delete('/carts/:uuid', function (req, res) {

    var cartUUID = req.params.uuid;
    
    console.log('/carts/' + cartUUID);

    dataManager.deleteCart(cartUUID, function (error, data) {
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
    var args = {
        "cart_uuid": uuid,
        "new_values": req.body
    };
    dataManager.addNewItem(args, function (error, data) {
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
    var args = {
        "cart_uuid": uuid,
        "new_values": req.body
    };
    console.log('/carts/' + uuid + '/menus');

    dataManager.addNewMenu(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/menus/:uuid/items', function (req, res) {
    var uuid = req.params.uuid;
    var args = {
        "menuUUID": uuid,
        "new_values": req.body
    };
    console.log('/menus/' + uuid + '/items');

    dataManager.addNewItemToMenu(args, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.put('/items/:item_uuid', function (req, res) {
    var args = {
        "item_uuid": req.params.item_uuid,
        "new_values": req.body
    };
    console.log(args);
    console.log('/items/' + req.params.item_uuid);
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

app.put('/menus/:menu_uuid/items/:item_uuid', function (req, res) {
    var args = {
        "item_uuid": req.params.item_uuid,
        "menu_uuid": req.params.menu_uuid,
        "new_values": req.body
    };
    console.log(req.body);
    console.log('/menus/' + req.params.menu_uuid + '/items/' + req.params.item_uuid);
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

app.put('/menus/:menu_uuid/items/:item_uuid', function (req, res) {
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
    var userData = req.body;
    
    console.log('/users' + req.body);
    
    if (!req.body.email) {
        email = "Not Given";
    }
    dataManager.registerUser(userData, function (error, data) {
        if (error) {
            res.send(error);
        }
        if (data) {
            res.set('Content-Type', 'application/json');
            res.send(data);
        }
    });
});

app.post('/authenticate', function (req, res) {
    var credentials = req.body;
    
    console.log('/authenticate ' + JSON.stringify(req.body));
    
    dataManager.authenticateUser(credentials, function (error, data) {
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
