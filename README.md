# farm-budgets-sdk
NodeJS SDK for the farm-budgets-app.  farmbudgets.org

# Quick Start

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

Or a more complete example.  This will load your user data, preform an empty search,
load the first budget returned, then display it's total.

```JavaScript
var sdk = require('../index')(require('/etc/farm-budgets-sdk/setup.json'));

sdk.login(function(resp){
  console.log('Hello, '+sdk.me().display_name);

  sdk.budgets.search({}, function(resp){
    console.log('Loading: '+resp.results[0].id+' '+resp.results[0].name);
    sdk.load(resp.results[0].id, onBudgetLoad);
  });
});

// load() returns a Budget class, not raw data object
function onBudgetLoad(budget) {
  console.log(budget.getName());
  console.log(sdk.getTotal());
}
```

# API

All callback functions return a single response object.  If an error occurred
a error = true flag will be set along with a message property.  If message = 'request error',
there was an issue with the http call, and additional *response* property will
be set containing the full http response object.  API errors will NOT contain the
response object.

## Authorities

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

## Materials

Calls to view, create, edit, search and delete materials.

#### materials.get(id, callback)

Get a material by unique material id.

- **id**: unique material id.

Returns material object.  See schema below.

#### materials.hasRequired(id, callback)

Given a complex material id.  Does the materials authority have the required
materials in the same location.

- **id**: unique material id.

Returns object.

#### materials.search(query, callback)

Search for materials.  All [MongoDB queries](https://docs.mongodb.org/manual/tutorial/query-documents/) are allowed.

- **query**: query object. see here, all fields optional, but object is required:

```JavaScript
{
  query : {} // mongodb query
  start : 0, // start index
  stop : 10, // stop index
}
```

#### materials.suggest(queryText, callback)

Suggest existing materials for given queryText

- **queryText**: string to find material suggestions for.  Ex: 'tractor'.  Query text
can contain locations and authorities to help limit the suggestions.  Ex: 'tractor california'

Returns list or material objects.

#### materials.save(material, callback)

Create or update material

- **material**: material object.  See schema below.  If id is provided an update
will be preformed, otherwise insert.

Returns {succes:true} on success.

#### materials.delete(id, callback)

Delete material with given unique id.

- **id**: unique material id

Returns {succes:true} on success.

## Budgets

Calls to view, create, edit, search and delete budget.

#### budgets.get(id, callback)

Get a budget by unique budget id.

- **id**: unique budget id.

Returns budget object.  See schema below.

#### budgets.contributedTo(callback)

Get a list of budgets you have contributed to.

Returns list of budget objects.

#### budgets.uses(materialId, callback)

Get a list of budgets that use the given material.  This is good to check BEFORE
you delete a material.

- **materialId**: unique material id.

Returns list of budget objects.

#### budgets.search(query, callback)

Search for budgets.  All [MongoDB queries](https://docs.mongodb.org/manual/tutorial/query-documents/) are allowed.

- **query**: query object. see here, all fields optional, but object is required:

```JavaScript
{
  query : {} // mongodb query
  start : 0, // start index
  stop : 10, // stop index
}
```

#### budgets.save(budget, callback)

Create or update budget.

- **budget**: budget object.  See schema below.  If id is provided an update
will be preformed, otherwise insert.

Returns {succes:true} on success.

#### budgets.delete(id, callback)

Delete budget with given unique id.

- **id**: unique budget id

Returns {succes:true} on success.

# Schemas

## Authority

```JavaScript
{
  name : "", // authority name
  description : "" // description of authority
}
```

## Material

There are two material schemas.  There type is determined by the **type** property.
Material type can be 'simple' or complex

#### Simple Material
Simple or base material

```JavaScript
{
  authority : 'string', // name of authority (required)
  source : 'string', // source information.  Can be markdown
  class : 'string', // class (group) of material
  id : 'string', // uid of material
  locality : 'array', // array of string locations for authority (required)
  name : 'string', // name of material (required)
  description : 'string', // description of material
  price : 'number', // price of material
  year : 'number', // year for material price
  type : 'string', // must be 'simple'.  (required)
  units : 'string' // material units.  Needs to follow UCUM format.  See more below
}
```

#### Complex Material
A material that requires other materials

```JavaScript
{
  authority : 'string', // name of authority (required)
  class : 'string', // source information.  Can be markdown
  source : 'string', // class (group) of material
  id : 'string', // uid of material
  locality : 'array', // array of string locations for authority (required)
  name : 'string', // name of material (required)
  description : 'string', // description of material
  type : 'string', // must be 'complex'.  (required)
  units : 'string', // material units.  Needs to follow UCUM format.  See more below

  // require materials
  // this objects property keys should be the name of the require materials.
  // required materials can be simple or complex.  There is no relation to required
  // materials other than the name.
  materials : {
    _material_name_ : {
      amount : 'number', // amount of require material
      units : 'string' // amount units of require materials. Needs to follow UCUM format.  See more below
    }
  },

  // unique required simple materials.  You can add simple materials to a complex
  // material that are only used by this complex material and cannot be shared
  // with other materials.
  // This objects properties should be the name of the simple materials
  unique : {
    _material_name_ : {
      price : 'number', // price of simple material
      units : 'string' // units of price for simple material. Needs to follow UCUM format.  See more below
    }
  }
}
```

## Budget
To help readability the budget object has been split into two parts.

#### Base Budget Object

```JavaScript
{
  authority : 'string', // name of authority (required)
  locality : 'array', // array of string locations for authority (required)
  name : 'string', // budget name
  id : 'string', // unique budget id
  materialIds : 'array', // array of material ids currently associated with this budget
  reference : 'string', // unique budget id of reference budget.  If provided, the operations
  // property should be omited.
  commodity : 'string', // name of crop

  // information about the farm
  farm : {
    name : 'string', // farm name
    size : 'string', // farm size
    units : 'string' // units for farm size.  Needs to follow UCUM format.  See more below
  },

  operations : [] // array of operation objects, see more below
}
```

#### Budget Operations Object
```JavaScript
{
  name : 'string', // operation name
  units : 'string', // units for operation. Needs to follow UCUM format.  See more below

  // array of objects.  
  schedule : [{
    date : 'string', // start date.  Format:  YYYY-MM-DD
    length : 'string', // length of operation
    units : 'string' // length of operation units.  Options: 'year', 'month' or 'day'
  }],

  // array of require materials for operation
  materials : [{
    amount : 'number', // amount of material required
    id : 'string', // unique material id being used
    name : 'string', // name of material
    note : 'string', // note about material usage
    units : 'string' // units for material amount. Needs to follow UCUM format.  See more below
  }]
}
```


# Units

All units MUST be provided in UCUM format [http://unitsofmeasure.org/ucum.html](http://unitsofmeasure.org/ucum.html)
