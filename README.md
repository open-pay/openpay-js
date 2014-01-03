#Openpay.js
##Introduction
###¿Qué es Openpay.js?
Openpay.js is a Javascript library designed to facilitate the processing of credit card charges from a website directly invoking our services without invoking the origin server.

###Benefits:
* The transaction information does not have to pass through the origin server, it is sent directly to Openpay.
* It is the easiest and fastest way to integrate a charges module on a ecommerce website.

##Implementation
###Add the library
The first step in the integration is to add the library to the page from which payments will be made. Add the following code: 
```HTML
<script type="text/javascript" src="http://public.openpay.mx/openpay.v1.min.js"></script>
```
###Configuration
Before you can use Openpay.js is necessary to configure both the merchant id, and public key that were assigned when you created your account. With these data, Openpay can identify the account to which the charges are paid.

You can configure both fields with the following methods **OpenPay.setId()** y **OpenPay.setApiKey()**, respectively:
```javascript
OpenPay.setId('MERCHANT_ID');
OpenPay.setApiKey('PUBLIC_API_KEY');
```
|Notes:|
|:------|
|* Both MERCHANTID as PUBLIC_API_KEY, are obtained from the homepage of your account on the [Openpay](http://www.openpay.mx/) site.|
|* You should never use your private key along with the library, because it is visible on the client side.|

###Sandbox Mode
While the implementation is done it is possible to test prior to actual charges on a real credit card, for which the method is used:**OpenPay.setSandboxMode()** which will help us to enable or disable the sandbox (test) mode requests that are made with OpenPay.js
```javascript
OpenPay.setSandboxMode(FLAG);
```
The method receives as a parameter a boolean flag (true / false) to turn test mode. If necessary, you can use the OpenPay.getSandboxMode () method to determine the status of the Sandbox Mode at any time:
```javascript
OpenPay.getSandboxMode(); // TRUE/FALSE, dependiendo si el modo está activado o no.
```
###Processing Charges
To make a card charge is necessary call the method **OpenPay.card.charge()**:
```javascript
OpenPay.card.charge(CHARGE_PARAMETERS_OBJECT, SUCCESS_CALLBACK, ERROR_CALLBACK);
```
####Example request:
```javascript
OpenPay.card.charge({
    amount: 100.00,
	description: 'COMPRA/VENTA',
	order_id: 'A000001',
	card: {
		card_number: '5555555555554444',
		cvv2: '123',
		holder_name: 'Juan Pérez',
		expiration_month: '01',
		expiration_year: '14',
		address: {
			street: 'Av. Paseo de la Reforma',
			exterior_number: '325',
			interior_number: null,
			city: 'Ciudad de México',
			region: 'DF',
			postal_code: '06500'
		}
	}
}, onSuccess, onError);
```
The first parameter is a Javascript object containing information charge card, while the second and third parameters define the functions that will be called if the transaction was successful or failed (respectively).
The definition of the object by the find [here](http://docs.openpay.mx/#cargos).
###Creating cards
To create a card you need to call the method **OpenPay.card.create()**:
```javascript
OpenPay.card.create(CREATE_PARAMETERS_OBJECT, SUCCESS_CALLBACK, ERROR_CALLBACK);
```

|Notes|
|:----|
|* With this method you can create cards at both merchant and customers.|
|* You can see the CLIENT-ID, into dashboard from the list customers.|
####Example of creating a merchant card:
```javascript
OpenPay.card.create({
      "card_number":"4111111111111111",
      "holder_name":"Juan Perez Ramirez",
      "expiration_year":"20",
      "expiration_month":"12",
      "cvv2":"110",
      "address":{
         "city":"Querétaro",
         "line3":"Queretaro",
         "postal_code":"76900",
         "line1":"Av 5 de Febrero",
         "line2":"Roble 207",
         "state":"Queretaro",
         "country_code":"MX"
      }
}, onSuccess, onError);
```
####Example of creating customer card:
```javascript
OpenPay.card.create({
      "card_number":"4111111111111111",
      "holder_name":"Juan Perez Ramirez",
      "expiration_year":"20",
      "expiration_month":"12",
      "cvv2":"110",
      "address":{
         "city":"Querétaro",
         "line3":"Queretaro",
         "postal_code":"76900",
         "line1":"Av 5 de Febrero",
         "line2":"Roble 207",
         "state":"Queretaro",
         "country_code":"MX"
      }
}, onSuccess, onError, "aos2jvwpyyy4nhbodxbu");
```
The first parameter is a Javascript object containing information on the card, while the second and third parameters define the functions that will be called if the operation was successful or failed (respectively).
The definition of object card find it [here](http://docs.openpay.mx/#tarjetas).

###Response functions
The response functions serve as handles of the result of the transaction. These, are simple Javascript functions but receive input parameters with a predetermined format.

| Notes |
| :------------- |
|* Although the response functions are optional, we recommend to implement the outcome of the transaction can be monitored on the website.|

###SuccessCallback
This function is called when the transaction is successful from start to finish. Get a single parameter which is a Javascript object with the data from [transaction](http://docs.openpay.mx/#api-referencia$objeto-transacción).
Complete example of implementing a function SuccessCallback:
```javascript
function SuccessCallback(response) {
	alert('Transacción exitosa');
	var content = '', results = document.getElementById('resultDetail');
	content .= 'Autorización: ' + response.data.authorization + '<br />';
	content .= 'Descripción: ' + response.data.description + '<br />';
	content .= 'Tipo de tarjeta usada: ' + response.data.card.brand + '<br />';
	results.innerHTML = content;
}
```
Example of the transaction object:
```json
{
   "id":"trehwr2zarltvae56vxl",
   "authorization":null,
   "transaction_type":"payout",
   "operation_type":"out",
   "method":"bank",
   "creation_date":"2013-11-14T18:29:35-06:00",
   "order_id":"000001",
   "status":"in_progress",
   "amount":500,
   "description":"Pago de ganancias",
   "error_message":null,
   "customer_id":"afk4csrazjp1udezj1po",
   "bank_account":{
      "alias":null,
      "bank_name":"BANCOMER",
      "creation_date":"2013-11-14T18:29:34-06:00",
      "clabe":"012298026516924616",
      "holder_name":"Juan Tapia Trejo",
      "bank_code":"012"
   }
}
```
###ErrorCallback
This function will be executed each time a transaction has failed (for any reason, before or after sending the request). Like the method **SuccessCallback()**, takes a single parameter which is a Javascript object with detailed fault.

The response object fields are described below:

|Field|Format|Description|
| -------- | --------- | --------- |
|status|Integer|Describe the HTTP status of the transaction. If an error before sending the request occurs, the status will be zero.|
|message|String|Short description of the error that occurred. It can be one of the following values​​: "Unknown error", "Request error", "Response error (end Unknown status)", "Empty or invalid OpenPay ID", "Empty or invalid API Key", "Browser error", "timeout after X milliseconds ".|
|data|Objeto|Contains an [Object Error] (http://docs.openpay.mx/ # errors) with the error information in the transaction provided by the server OpenPay.|

Complete example of implementing a function ErrorCallback:
```javascript
function ErrorCallback(response) {
	alert('Fallo en la transacción');
	var content = '', results = document.getElementById('resultDetail');
	content .= 'Estatus del error: ' + response.data.status + '<br />';
	content .= 'Error: ' + response.message + '<br />';
	content .= 'Descripción: ' + response.data.description + '<br />';
	content .= 'ID de la petición: ' + response.data.request_id + '<br />';
	results.innerHTML = content;
}
```
Example ErrorCallBack message:
```json
{
   "status":409,
   "message":"Request error",
   "data":{
      "category":"account",
      "description":"The Order ID has been processed already.",
      "error_code":1006,
      "http_code":409,
      "request_id":"9c899b94-74de-480c-864f-f1d5b226362c"
   }
}
```
###Types error responses
In addition to the status field that saves the state of the transaction, it is possible to determine the error that happened through the message field. The message may be one of the following:

* **"Empty or invalid OpenPay ID"**: It happens when you have not properly configured the user ID with the OpenPay.setId () method 
* **"Empty or invalid API Key"**: Like the above error happens when you have not configured your API Key with OpenPay.setApiKey () method
* **"Browser error"**: It is triggered when there is an error in the browser that prevents the request to succeed. It may be caused by caracterísiticas that are necessary to run some code and are missing in the browser. For more information see the "Compatibility and Requirements" section.
* **"Request error"**: This error indicates that an error occurred in the server Openpay. May be due to missing parameters, formats, or some other problem that prevents a successful transaction.
* **"Response error (Unknown final status)"**: When this error occurs, it means that the transaction request was submitted successfully to Openpay server but no response was received. This may be due to a problem in Openpay. For more information contact OpenPay.
* **"Timeout after X milliseconds"**: Thrown when the request has taken a long time to run and therefore the response time expires.
* **"Unknown error"**: Raised when there is an unknown error that prevents the request is made. It may be due to problems in the browser or connectivity.

##Card Validation Functions
Besides the functions to process card charges, Openpay.js also includes some functions to validate key data necessary to carry out the transaction, especially regarding card numbers.

Available methods are:

* `OpenPay.card.validateCardNumber()`
* `OpenPay.card.validateCVC()`
* `OpenPay.card.validateExpiry()`
* `OpenPay.card.cardType()`

###Number card validation
To validate a card number can use the method **OpenPay.card.validateCardNumber()**.

This method receives as parameter a String with the card number to be validated and return one true / false if it is a valid card number and is accepted by Openpay. 
Example:
```javascript
OpenPay.card.validateCardNumber('5555555555554444);
```
This method is very useful for determining whether a card number is valid and if a candidate for use with Openpay, so we recommend that you use before attempting a charge card.

Examples:
```javascript
OpenPay.card.validateCardNumber('5555555555554444'); // TRUE. Valid card number and accepted by OpenPay (MASTERCARD)

OpenPay.card.validateCardNumber('378282246310005'); // FALSE. Number of valid card but not accepted by OpenPay (AMEX)
```
###Security Code Validation
To validate a security code is used the method **OpenPay.card.validateCVC()**.

This method takes a String as a parameter and returns true / false if the string is valid. Example:
```javascript
OpenPay.card.validateCVC('123'); // válido
OpenPay.card.validateCVC('1234'); // válido
OpenPay.card.validateCVC('A23'); // inválido
```
###Expiration date validation
For this purpose is used the method **OpenPay.card.validateExpiry()**.

Receive two strings as parameters to represent the month and year of expiry of the card. Returns true / false if the combination of both data, month and year, determine a valid expiration date. Example:
```javascript
OpenPay.card.validateExpiry('01', '2013'); // inválido
OpenPay.card.validateExpiry('05', '2015'); // válido
```

###Card Type
ECan be determined (most of the time) the type of card that a card number belongs. For this, is used the method **OpenPay.card.cardType()**.

The method receives as a parameter a card number and returns a String with the name of the card type. Examples:
```javascript
OpenPay.card.cardType('5555555555554444'); // Mastercard
​OpenPay.card.cardType('4111111111111111'); //​ Visa
OpenPay.card.cardType('4917300800000000'); // Visa Electron
OpenPay.card.cardType('378282246310005'); // American Express
OpenPay.card.cardType('30569309025904'); // Diners Club Carte Blanche
OpenPay.card.cardType('6011111111111117'); // Discover
OpenPay.card.cardType('3530111333300000'); // JCB
```
##Compatibility and requirements
To use Openpay.js You must have one of the following browsers:

* Chrome 29.0+
* Firefox 23.0+
* Safari 5.1+
* Opera 17.0+
* iOS Safari 4.0+
* Android Browser 2.1+
* Blackberry Browser 7.0+
* IE Mobile 10.0

Browsers must have support for XMLHttpRequest and JSON Parser libraries.
