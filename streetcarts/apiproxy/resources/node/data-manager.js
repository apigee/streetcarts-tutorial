var request = require('request');

var host = 'https://api.usergrid.com';
var appPath = '/docfood/foodcarttest';
var endpointPath = '';
var queryParams = '';
var token = '';
var path = '';

module.exports = {
	getAllCarts : function(args, callback){

		endpointPath = '/foodcarts';
		var uri = host + appPath + endpointPath;

		var options = {
			uri: uri,
			method: "GET"
		};

		return makeRequest(options, function(response)
		{
			callback(response);
		});
	},
	getCartsOwnedByUser : function(userUUID, callback){

		endpointPath = '/users/' + userUUID + '/owns';		
		var uri = host + appPath + endpointPath;

		var options = {
			uri: uri,
			method: "GET"
		};

		return makeRequest(options, function(response)
		{
			callback(response);
		});
	},
	getMenusForCart : function(cartUUID, callback){

		endpointPath = '/foodcarts/' + cartUUID + '/publishes';
		var uri = host + appPath + endpointPath;

		var options = {
			uri: uri,
			method: "GET"
		};

		return makeRequest(options, function(response)
		{
			callback(response);
		});
	},
	getItemsForMenu : function(menuUUID, callback){

		endpointPath = '/menus/' + menuUUID + '/includes';
		var uri = host + appPath + endpointPath;

		var options = {
			uri: uri,
			method: "GET"
		};

		return makeRequest(options, function(response)
		{
			callback(response);
		});
	},
	getDetailsForItem : function(itemUUID, callback){

		endpointPath = '/items/' + itemUUID;

		var uri = host + appPath + endpointPath;

		var options = {
			uri: uri,
			method: "GET"
		};

		return makeRequest(options, function(response)
		{
			callback(response);
		});
	}
};


function makeRequest(options, callback) {

	request(options, function(error, response, body) {
		callback(body);
	});
}
