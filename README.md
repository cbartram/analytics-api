## Analytics API

### Description

A Basic Analytics Module API for communicating with the predefined backend

## Installation and Setup

Install this package from NPM using `npm i --save analytics-api-fb`

after that you can include the transpiled code into your project with

`import AnalyticsAPI from 'analytics-api-fb/lib/index.js'`

Thats it!

### Usage

For the purpose of all these examples we are going to use the Analytics Widget to predict which Pizza Toppings users might want to add to their pizza.

We have several elements within our pizza creation form and we need analytics for all of them:
- Crust Style
- Meat
- Veggies

For example many people might like sausage of their pizza we could suggest other options to them based on what we think they may like such as:
- turkey
- ham
- bacon
- beef

For this example a frequency classifier is going to be our best model so we can utilize the per-subject-frequency
method to easily predict toppings for this form.

```javascript
//First we import the Client Library
import AnalyticsWidget from 'analytics-api-fb/lib/index.js';

//Next we want to register a new pick predictor
new AnalyticsWidget.registerPickPredictor({
    namespace: "Pizza.createForm",
	elements: ["Veggies", "Meats", "Crust"],
	method: "per-subject-frequency"
}, (data) => {
    //data is the result of the Analytical Functions
});
```

If you would prefer to use the raw API endpoints instead of the client side library then you must **register your forms namespace before any documents can be inserted**
To register a namespace use the endpoint `/form/register` with a POST request body which looks like this

```json
{
	"namespace": "Pizza.createForm",
	"elements": ["Meat", "Veggies", "Crust Style"],
	"method": "per-subject-frequency"
}
```
Upon the first form registration if the operation is successful the server will respond with the JSON that follows:
```json
{
    "success": true,
    data: []
}
```
**Data will be an empty array** because you have not inserted any data into this namespace and so we cannot suggest relevant
fields when there is no data in the next step you will learn how to insert data into this namespace for querying and predictions.

The API provides a fluid way to query, insert, and run analytical functions on data, however, **it is the responsibility of the programmer
to wire up the data coming from the forms and pass it into the API for insertion.**

In a React App state is a perfect way to take input from the forms and use the AnalyticsWidget API insert the data directly into the correct namespace
check out the example below:

```jsx
import React, {Component} from 'react'

export default class PizzaForm extends Component
            constructor() {
                super();

                this.state = {
                    veggie: null
                }
            }

            handleChange = (e) => this.setState({veggie: e.target.value)});

            insertData = () => {
                const {veggie} = this.state;

                //Insert data
                AnalyticsWidget.insert({
                    namespace: ["Pizza.createForm"],
                    elements: ["Veggies"],
                    values: [veggie],
                });
            }

            ...
            render() {
                return(
                    <input type="text" onChange={this.handleChange} />
                    <button type="submit" onClick={this.insertData} />
                )
            }
```

Notice how it is up to the **programmer to ensure input is updated to state when the `onChange` event occurs** and
the `AnalyticsWidget` only serves to insert the form data into the proper namespace and table.

Currently we know how to register new namespaces (when new forms are created), run analytics on form fields, and insert new form data
into the correct namespace to allow for better predictions. But What about Querying specific data? Nothing the fear the Query API is here!

The Query API is a powerful part of the Analytics Widget and it allows you to quickly used chained method calls to reduce
a data set based on specific constraints. Lets jump in!

All Queries start with the `query()` method which tells the API that each method call henceforth is a constraint to the query.
`query()` takes no parameters and by default will create a brand new query to the database. The last query API call must be `exec()` which takes a callback
function to retrieve the results of your query! That's it! The query API is beautiful because it can be as simple
or complex as your needs!

For instance:

```javascript
AnalyticsWidget.query().exec(data => {
    console.log(data);
})
```
We notice in the query above we invoke the query API with `query()` and then instantly end it with `exec()` so this query says
"Get me all documents"

We can constrain the data set by chaining the `databse()` method to the query like so:

```javascript
AnalyticsWidget.query().database("Pizza.createForm").table("Meats").exec(data => {
    console.log(data);
})
```
As you might have guessed this query pulls every 'Meat' document within the 'Pizza.createForm' namespace.
We can add `and`, `like`, `where`, `limit` and `or` clauses as well to further constrain the data set!

Lets run through another example:

```javascript
AnalyticsWidget.query().database("Pizza.createForm").table("Veggies").like("Pepp").limit(10).exec(data => {
    console.log(data);
});
```

This query finds all documents in the Veggies namespace where the value includes the text "Pepp" (peppers would be returned in this instance)
but we also constrain the data set to a maximum of 10 records.

We can also use the `onlyUser($userID)` method to ensure
that each document that comes back is a document submitted by your logged in user, simply pass in your applications unique user ID and
the API takes care of the rest!

How about running analytics on a custom data set? No problem!

```javascript
AnalyticsWidget.query().database("Pizza.createForm").table("Meats").where("Turkey").and("Tomato").onlyUser("al9qI12W9").exec(data => {
    //We can pass our data right into the analytics function!!
    AnalyticsWidget.analyze({
        data,
        method: 'per-subject-frequency'
    }, result => {
        //result holds the most frequently added toppings given a unique data set!
    });
})
```

As you can see the Query API is a powerful part of any developer's workflow; It aims to make it simple to pull out aggregated sets of data
for analysis and prediction!

Check out our API endpoints below!

## API Endpoints

| **Endpoint**     	| **Request Type** 	| **Body**                                                                                                                    	|
|------------------	|------------------	|-----------------------------------------------------------------------------------------------------------------------------	|
| `/insert`        	| `POST`           	| ```{"namespace": "Pizza.createForm","elements": ["Veggies", "Meat"],"values": ["Peppers", "Pepperoni"]}```               	|
| `/form/register` 	| `POST`           	| ```{"namespace": "Pizza.createForm","elements": ["Meat", "Veggies", "Crust Style"],"method": "per-subject-frequency"}``` 	|
| `/remove`        	| `GET`            	| None                                                                                                                        	|
| `/all`           	| `GET`            	| None                                                                                                                        	|
| `/query`         	| `POST`           	| ```{"namespace": "Pizza.createForm","table": "Meat","query": {"where": ["Turkey"],"and": ["Tomato", "Thin"]}}```      	|
| `/analytics`         	| `POST`           	| ```{"data": [ //Array of your data ], "method": 'per-subject-frequency'}```      	|

