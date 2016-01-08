# farm-budgets-sdk
NodeJS SDK for the farm-budgets-app.  farmbudgets.org

## Quick Start

Install sdk

```bash
npm install CSTARS/farm-budgets-sdk
```

Visit [farmbudgets.org](http://farmbudgets.org), create an account if you don't
have one, then login and click 'My Setup' -> 'My Account'.  Copy the developer token.
If the token is expired, click 'Generate New Token'.

Note, you can also setup and run [farm-budgets-app](https://github.com/CSTARS/farm-budgets-app)
locally if you wish.

Once you have the token, open a text editor and enter:

```JavaScript
var sdk = require('farm-budgets-sdk')({
  host : 'http://farmbudgets.org',
  token : 'your-developer-key-here'
});

// list all the authorities I belong to.
sdk.authorities.list(function(resp){
     console.log(resp);
});
```

## API

All callback functions return a single response object.  If an error occurred
a error = true flag will be set along with a message property.  If message = 'request error',
there was an issue with the http call, and additional *response* property will
be set containing the full http response object.  API errors will NOT contain the
response object.

### Authorities

Calls to view, create, edit authorities.

#### authorities.list(callback)

Returns list of all authorities you have access to.

#### authorities.get(authorityName, callback)

- **authorityName**: name of authority. Ex: 'AHB'.

Returns name, description and list of members.

#### authorities.create(authority, callback)

- **authority**: authority object.  See authority schema below.

Returns {success:true} on success.

#### authorities.update(authority, callback)

Update authority.  currently only the description can be updated.  The name is permanent.

- **authority**: authority object.  See authority schema below.

Returns {success:true} on success.

#### authorities.grantAccess(authorityName, email, callback)

Add user to authority.

- **authorityName**: name of authority
- **email**: email address of user to add.

Returns {success:true} on success.

#### authorities.removeAccess(authorityName, email, callback)

remove user from authority.

- **authorityName**: name of authority
- **email**: email address of user to remove.

Returns {success:true} on success.

## Schemas

### Authority

```JavaScript
{
  name : "", // authority name
  description : "" // description of authority
}
```
