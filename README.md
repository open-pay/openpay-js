#Openpay.js
##Introduction
###What is Openpay.js?
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

You can configure both fields with the following methods **OpenPay.setId()** and  **OpenPay.setApiKey()**, respectively:
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

###Creating cards
To create a card you need to call the method **OpenPay.card.create()**:
```javascript
OpenPay.card.create(CREATE_PARAMETERS_OBJECT, SUCCESS_CALLBACK, ERROR_CALLBACK, {CUSTOMER-ID});
```

|Notes|
|:----|
|* With this method you can create cards at both merchant and customers.depending on if you include the **CUSTOMER-ID** in the call or not. The **CUSTOMER-ID** parameter is optional.|
|* You can see the **CUSTOMER-ID**, into dashboard from the list customers.|
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

###Creating cards from html form
The library Openpay.js gives you the **OpenPay.card.extractFormInfo()** method that draws the card information directly from some form:
```javascript
OpenPay.card.extractFormInfo(CREATE_FORM_OBJECT);
```
|Notes|
|:----|
|The extractFormInfo method receives as a parameter the form object, and based on that creates and returns a JSON object with the card information. This function does not send the information obtained only form values ​​and converts it to JSON format.|

Furthermore the **OpenPay.card.extractFormAndCreate()** method is provided  which precesses the object form and upload the information:
```javascript
OpenPay.card.extractFormAndCreate(CREATE_FORM_OBJECT, SUCCESS_CALLBACK, ERROR_CALLBACK, {CLIENTE-ID});
```
|Notes|
|:----|
|This function is identical to the create method, with the difference that receives as a parameter the form object. This function sent the information, get form data, converts it to JSON format and send the information to openpay's servers.|

Finally, on the form, all you have to do is add data-attributes **data-openpay-card** and **data-card-data-openpay-address** on inputs where card information is captured and address respectively, as shown then:

```html
<form id="processCard" name="processCard">
    <p>Holder Name:</p><input data-openpay-card="holder_name" size="50" type="text">
    <p>Card number:</p><input data-openpay-card="card_number" size="50" type="text">
    <p>Expiration year:</p><input data-openpay-card="expiration_year" size="4" type="text">
    <p>Expiration month:</p><input data-openpay-card="expiration_month" size="4" type="text">
    <p>cvv2:</p><input data-openpay-card="cvv2" size="5" type="text">
    <p>Street:</p><input data-openpay-card-address="line1" size="20" type="text">
    <p>Number:</p><input data-openpay-card-address="line2" size="20" type="text">
    <p>References:</p><input data-openpay-card-address="line3" size="20" type="text">
    <p>Postal code:</p><input data-openpay-card-address="postal_code" size="6" type="text">
    <p>City:</p><input data-openpay-card-address="city" size="20" type="text">
    <p>State:</p><input data-openpay-card-address="state" size="20" type="text">
    <p>Country code:</p><input data-openpay-card-address="country_code" size="3" type="text"> 
    <input id="makeRequestCard" type="button" value="Make Card">
</form>
```

For a complete example, download the test from the github site:[openpay.js](https://github.com/open-pay/openpay-js)

###Response functions
The response functions serve as handles of the result of the transaction. These, are simple Javascript functions but receive input parameters with a predetermined format.

| Notes |
| :------------- |
|* Although the response functions are optional, we recommend to implement the outcome of the transaction can be monitored on the website.|

###SuccessCallback
This function is called when the transaction is successful from start to finish. It receives a single parameter which is a Javascript object with a data property representing a [card](http://docs.openpay.mx/#tarjetas) object.
Complete example of implementing a function SuccessCallback:
```javascript
function SuccessCallback(response) {
	alert('Transacción exitosa');
	var content = '', results = document.getElementById('resultDetail');
	content .= 'Número de tarjeta: ' + response.data.card_number + '<br />';
	content .= 'Tipo de tarjeta: ' + response.data.brand + '<br />';
	results.innerHTML = content;
}
```
Example of the card object:
```json
{
   "type":"debit",
   "brand":"mastercard",
   "address":{
      "line1":"Av 5 de Febrero",
      "line2":"Roble 207",
      "line3":"Queretaro",
      "state":"Queretaro",
      "city":"Querétaro",
      "postal_code":"76900",
      "country_code":"MX"
   },
   "id":"kzd7vh8hp99k2h46gdu0",
   "card_number":"1881",
   "holder_name":"Juan Perez Ramirez",
   "expiration_year":"20",
   "expiration_month":"12",
   "allows_charges":true,
   "allows_payouts":false,
   "creation_date":"2014-01-07T19:14:03-06:00",
   "bank_name":"DESCONOCIDO",
   "bank_code":"000",
   "customer_id":null
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
This method is very useful for determining whether a card number is a valid candidate for use with Openpay, so we recommend that you use it before attempting to charge a card.

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
The type of card that a card number belongs to can be determined most of the time. For this, use the method **OpenPay.card.cardType()**.

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

##Fraud detection using device data
OpenPay can use the device information of a transaction in order to better detect fraudulent transactions.
To do this, add the following code to your checkout page, when collecting payment information:
```HTML
<script type="text/javascript" src="http://public.openpay.mx/openpay-data.v1.min.js"></script>
```

Then, in your javascript, call OpenPay.deviceData.setup() to generate a Device Data.

```javascript
// If you are testing your application, set Sandbox Mode first
// OpenPay.setSandboxMode(true);
var deviceDataId = OpenPay.deviceData.setup("formId");
```

This method generates an identifier for the customer's device data. This value needs to be stored during checkout, and sent to OpenPay when processing the charge.

The method takes two optional parameters: 

The first is an existing form's id. If given, a new hidden input field will be added to it, with the value of the generated deviceDataId. 

The second parameter specifies the generated field's name and id. If ommited, they will default to "deviceDataId".

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
