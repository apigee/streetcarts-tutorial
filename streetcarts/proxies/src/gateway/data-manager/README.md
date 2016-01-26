# StreetCarts Data Manager

The data manager is a Node.js JavaScript file that is an interface between StreetCarts API proxies in Edge (foodcarts, menus, items, users, and accesstoken) and the API BaaS data store. Fundamentally, the data manager uses the API BaaS REST APIs to:

- Perform CRUD operations on behalf of the proxies, including about user data.
- Generate errors related to data store requests.
- Manage authorization for access to resources.

### Flow of data

[TBD]

#### Handling requests generally

All GET requests are unauthenticated -- any user can request a list of foodcarts, menus, and food items. PUT/POST/DELETE requests require authentication and authorization, as described below. This section describes how requests are generally handled by the data manager.

1. Requests sent to a proxy path flow through the path, through its policies toward the target endpoint, which accesses the data store.
2. Along the way, a KeyValueMapOperations policy retrieves from an Edge key-value map entry an API key required for access to the data-manager proxy and puts the key into a variable.
3. A Javascript policy executes JavaScript that generates the target URL used for access to the data-manager proxy, effectively chaining each request-handling proxy to the data-manager proxy. The script retrieves the data manager API key (along with the user's UUID and auth token, which aren't used for unauthenticated requests). See "Handling for authenticated requests".
4. Using the new target URL, Edge forwards the request to the data-manager proxy.
5. The data-manager proxy's target endpoint contains a ScriptTarget that points to a server.js file. This file implements a simple HTTP server that handles requests forwarded from other proxies.
6. Code in server.js implements a handler for each of the request paths sent by a client. When a request is received, the request's handler calls a function of data-manager.js that is specifically designed to format that request for the BaaS API.
7. The data-manager.js function uses incoming parameters to create a request for API BaaS, makes the request, then passes the result back to server.js, which passes it back to the proxy.

#### Handling for authenticated requests

Most PUT/POST/DELETE requests require an OAuth token corresponding to a user in the data store. API BaaS determines the user's access to the requested resource as set in BaaS permissions for the resource. The following describes the steps for authenticated requests. For more on how permissions are defined by StreetCarts, see "Permissions configuration".

1. In the StreetCarts authentication logic, a user sends a username and password to the accesstoken proxy. Edge passes these to the data-manager.js module, which uses them to authenticate the user with API BaaS, receiving a token.
2. After a successful authentication, data-manager.js passes information about the user, including the BaaS generated token, back to the Edge proxy.
3. The accesstoken proxy copies the API BaaS token into the Edge-generated OAuth token for use later, then the Edge token is passed back to the client.
3. For subsequent PUT/POST/DELETE requests, the client passes the user's Edge token back to a StreetCarts proxy.
4. When handling the request, the data-manager proxy's server.js file extracts the API BaaS token from the Edge token, then passes the BaaS token with its request to data-manager.js.
5. data-manager.js appends its request with the token. API BaaS responds to the request based on permissions set for each verb/resource pair (such as POST /foodcarts).
6. If the user has access to the resource, API BaaS proceeds with the request; if not, BaaS generally responds with a 401 error.


### Permissions configuration

Resource-level authorization for each request is handled by API BaaS through permissions set there. To set up these permissions, code in the data-manager proxy's data-manager.js file creates the following: 

For each foodcart created, the data manager creates:

- a user group. This is a group for cart owners who will have permission to update the cart's profile and delete the cart, as well as to create, update, and delete menus and menu items.
- two roles associated with each cart -- one will contain permissions to update and delete the cart; the other will contain permissions to create menus and menu items.
- permissions needed to update and delete the new cart, and to create its menus, and menu items.

For each menu created, the data manager creates:

- permissions needed to update and delete the menu. These are defined in the cart's menu-manager role.

For each menu items created, the data manager creates:

- permissions needed to update and delete the item. These are defined in the cart's menu-manager role.




