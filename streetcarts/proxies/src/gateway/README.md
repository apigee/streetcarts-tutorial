# StreetCarts API Proxies

StreetCarts is made up of several proxies. 

> For information about deploying StreetCarts, see the [Deploying and Running StreetCarts](https://github.com/apigee/docs-sandbox/wiki/Deploying-and-Running-StreetCarts) in the repository wiki.

| Proxy | Description | 
| --- | --- |
| accesstoken | Receives requests to authenticate users |
| data-manager | Not client-facing. Between client-facing proxies and data store to translate requests from clients into requests to the backend data store. |
| foodcarts | Receives requests to GET/POST/PUT/DELETE requests about food carts. Also receives requests to POST requests about menu items and menus. |
| items | Receives requests to GET/PUT/DELETE menu items. |
| menus | Receives requests to GET/PUT/DELETE menus. |
| reviews | Not yet full implemented. |
| users | Receives requests to GET/POST/PUT/DELETE requests about users. |

