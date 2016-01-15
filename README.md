# farm-budgets-sdk
NodeJS SDK for the farm-budgets-app.  farmbudgets.org

 - [Quick Start](#quick-start)
 - [Methods](#methods)
 - [Rest API](#rest-api)
 - [Schemas](#schemas)
 - [Classes](#classes)
 - [Units](#units)

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
var sdk = require('farm-budgets-sdk')(require('/etc/farm-budgets-sdk/setup.json'));

sdk.login(function(resp){
  console.log('Hello, '+sdk.me().display_name);

  sdk.budgets.search({}, function(resp){
    console.log('Loading: '+resp.results[0].id+' '+resp.results[0].name);
    sdk.loadBudget(resp.results[0].id, onBudgetLoad);
  });
});

// load() returns a Budget Class, not raw data object
function onBudgetLoad(budget) {
  console.log(budget.getName());
  console.log(sdk.getTotal());
}
```

# Methods

The following are the top level methods for the SDK.

#### getBudget()

Returns the currently loaded [Budget Class](#budget-class).

#### newBudget() / reset()

Create a new (empty) budget.  Resets the state of all controllers.  Returns the currently
created and loaded empty [Budget Class](#budget-class).  reset() does the same thing.

#### loadBudget(id, callback)

Load a budget with the given **id** string.  Callback response is either an error
object or a new [Budget Class](#budget-class).

#### setBudget(data)

Set budget initializes the controllers and returns a new [Budget Class](#budget-class)
instance.  The **data** parameter should match the response format of the API call
budgets.load(id):

```
{
  budget : {
    // raw budget schema object
  },
  materials : [
    // list of raw material schema objects
  ]
}
```

#### login(callback)

Set your user data.  This should be called before using the SDK as it is used to
locally check access to objects (speeds up error detection) as well as set default
authority values.

#### me()

Returns your user account object.

#### getTotal()

Returns the current total of the budget.

#### createMaterial(data)

Returns a new [Material Class](#material-class) instance.  If the **data** object is
not provided, the material instance will be empty.  This material will NOT be registered
to the material controller (ie available to the budget).  You must call
budget.addMaterial(material) to add the material to the budget. See the
[Budget Class](#budget-class) for more information.

# Rest API

- [Authorities API](#authorities-api)
- [Materials API](#materials-api)
- [Budgets API](#budgets-api)

All callback functions return a single response object.  If an error occurred
a error = true flag will be set along with a message property.  If message = 'request error',
there was an issue with the http call, and additional *response* property will
be set containing the full http response object.  API errors will NOT contain the
response object.

## Authorities API

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

## Materials API

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

## Budgets API

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

Below are the 'raw' object schemas use and returned by the API requests.

- [Authority Schema](#authority-schema)
- [Material Schema](#material-schema)
- [Budget Schema](#budget-schema)

## Authority Schema

```JavaScript
{
  name : "", // authority name
  description : "" // description of authority
}
```

## Material Schema

There are two material schemas.  There type is determined by the **type** property.
Material type can be 'simple' or complex

#### Simple Material Schema
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

#### Complex Material Schema
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

## Budget Schema
To help readability the budget object has been split into two parts.

#### Base Budget Schema

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

#### Budget Operations Schema
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

# Classes

Helper classes that add some sugar to working with farm-budget-app objects.

- [Budget Class](#budget-class)
- [Operation Class](#operation-class)
- [Material Class](#material-class)

## Budget Class

First, to create a budget class, use the SDK's load method.

```JavaScript
var sdk = require('farm-budget-sdk')({
  // config
});

sdk.load('budget-id-i-wish-to-load', function(budget){
  if( budget.error ) {
    throw(new Error(budget.message));
  }
  // 'budget' is an instance of the budget class
});
```

The budget class is wired into the farm budget app's calculator.  So using it's methods to update operations will automatically trigger recalc events.

#### Budget.addOperation(name)

Add a new operation to the budget with the given name.

- **name**: String name of new operation.

Returns [Operation Class](#operation-class) instance.

#### Budget.getOperation(name)

Get operation(s) with the given name.  Because operations can have the same name, an array will be returned.  If no name is provided, all operation instances are returned.

- **name**: String name of operation(s) to retrieve.

Returns array of [Operation Class](#operation-class) instances.

#### Budget.getFarm()

Get the farm data object.  Contains name, size and units.

Returns JavaScript Object.

#### Budget.setFarm(name, size, units)

Set the farm information.

- **name**: String name of farm.
- **size**: Number size of farm.
- **units**: String units of farm.

#### Budget.getAuthority()

Return the authority name of budget

Returns authority string.

#### Budget.setAuthority(authority)

Set the budget authority

- **authority**: String authority name.

#### Budget.getLocality()

Return the locality array.

Returns array of strings representing the locality of the budget.

#### Budget.setLocality(locality)

Set the locality array.

- **locality**: array of strings representing the locality of the budget

#### Budget.getName()

Get the name of the budget.

Return string name of budget.

#### Budget.setName(name)

Set the name of the budget.

- **name**: String name of the budget

#### Budget.getId()

Get the budgets unique id.

Return string budget id

#### Budget.setReference(budgetId)

Set this budget to be a reference budget.  Reference budgets will not use their own operations, rather the operations of the reference.  If you wish to undo this operation, simply pass null instead of a budget id.

- **budgetId**: String unique budget id to set reference to.

#### Budget.isReference()

Is this budget a reference budget.

Returns boolean, true if reference, false otherwise.

#### Budget.getCommodity()

Return the name of the commodity for this budget

Returns string commodity name

#### Budget.setCommodity(commodity)

Set the commodity of the budget.

- **commodity**: String name of the commodity

#### Budget.addMaterial(material)

Add a material to the list of budget materials to use.

- **material**: Material Class of material to add.




## Operation Class

#### Operation.schedule(startDate, length, units)

Schedule the operation.

- **startDate**: String or Date Object.  If string, should be in format YYYY-MM-DD.
- **length**: number length of operation
- **units**: units for length.  Options: 'year', 'month' or 'day'

#### Operation.unschedule(schedule)

Remove a schedule event.  Schedule should either be a numeric index or the schedule event object itself.  Both can be discovered using the Operation.getSchedule() method.

- **schedule**: index of scheduled event to remove or scheduled event object instance to remove.

#### Operation.getSchedule()

Get array of schedule event objects.

Returns array of schedule event objects with the follow structure:
```JavaScript
{
  name : "",
  length : "",
  units : ""
}
```

#### Operation.addRequiredMaterial(name, amount, units)

Add a required material to the operation.

- **name**: String name of the material.
- **amount**: number amount of required material.
- **units**: string units for amount of material.

#### Operation.getRequiredMaterials()

Get a list of the required material objects.

Returns list of required material objects with the following structure:
```JavaScript
{
  name : "",
  amount : 0,
  units : ""
}
```

#### Operation.removeMaterial(index)

Remove a required material.  The index can be found using Operation.getRequiredMaterials() which will return the entire list of materials.

- **index**: number index of material to remove.

#### Operation.getName()

Returns the operation name

#### Operation.setName(name)

Set the operation name.

- **name**: string name of the operation

#### Operation.getUnits()

Returns the operation units.

#### Operation.setUnits(units)

Set the operation units.

- **units**: string name of the units.  Should be in UCUM format.  See below.

## Material Class

First, to create a Material Class, use the SDK's createMaterial method.

```JavaScript
var sdk = require('farm-budget-sdk')({
  // config
});

var material = sdk.createMaterial(data);
```
A Material Class instance is returned.  The data is optional.  If you do pass data,
it should be in the form of the [Material Schema](#material-schema).

#### Material.getName()

#### Material.setName(name)

#### Material.getDescription()

#### Material.setDescription(description)

#### Material.getUnits()

#### Material.setUnits(units)

#### Material.getType()

#### Material.setType(type)

#### Material.getPrice()

#### Material.setPrice(price)

#### Material.getAuthority()

#### Material.setAuthority(authority)

#### Material.getLocality()

#### Material.setLocality(locality)

#### Material.getYear()

#### Material.setYear(year)

#### Material.getSource()

#### Material.setSource(source)

#### Material.getClass()

#### Material.setClass(class)

#### Material.save()

# Units

All units MUST be provided in UCUM format [http://unitsofmeasure.org/ucum.html](http://unitsofmeasure.org/ucum.html)

## Helpers

The SDK provides some helper methods for units.

#### units.cleanDollars

Currently the default (and only supported currency) is us$.  This, however, is not
supported by ucum.  This function will remove us$ and replace it with the base 1
so the unit can be parsed by ucum.

TODO:  In the future, this should be made to cleanCurrency and support several currencies.

#### units.ucumParse(units)

This is a simple wrapper method around ucum lib's ucum.parse(units) method.  This
method can be expensive and calling it hundreds/thousands of times can really slow
things down.  units.ucumParse(units) adds a simple in memory cache of all calls
made to the method, returning the cached value if available.

#### units.getLabel(baseUnit)

The SDK has a (slowly) growing list of labels for ucum units.  This method returns
a 'nice' label if available.  Example: ucum's '[acr_us]' would return 'acre'.
