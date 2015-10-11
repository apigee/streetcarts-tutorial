var dataManager = require( './data-manager' );
var express = require('express');
var app = express();

// Free public APIs

app.get('/carts', function (req, res) {
  console.log('/carts');
  dataManager.getAllCarts('', function(error, data) {
    var expand = req.query.expand;
    
    if (error){
      res.send(error);
    }
    if (data){
      if (expand !== undefined && expand == 'true') {
        res.set('Content-Type', 'application/json');
        res.send(data); 
      } else {

        var jsonData = JSON.parse(data);
        var cartdata = {
          cartinfo: []
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
  dataManager.getMenusForCart(uuid, function(error, data) {
    if (error){
      res.send(error);
    }
    if (data){
      res.set('Content-Type', 'application/json');
      res.send(data);      
    }
  });
});


// APIs for registered cart owners.

app.get('/users/:uuid/carts', function (req, res) {
  //var uuid = "4ab08a6a-6d16-11e5-817d-a9b5da1cd192";
  var uuid = req.params.uuid;
  console.log('/users/' + uuid + '/carts');
  dataManager.getCartsOwnedByUser(uuid, function(error, data) {
    if (error){
      res.send(error);
    }
    if (data){
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
 
