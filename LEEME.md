#Openpay.js
##Introducción
###¿Qué es Openpay.js?
Openpay.js es una librería Javascript diseñada para facilitar el procesamiento de cobros con tarjeta de crédito desde una página web sin la necesidad que la información de la transacción pase por el servidor origen.

###Ventajas:
* La información de la transacción no tiene que pasar por el servidor origen, sino que es enviada directamente a Openpay
* Es la manera más sencilla y rápida para integrar un módulo de cobros en una página web.

##Implementación
###Agregar la librería
El primer paso para la integración consiste en agregrar la librería la página desde la que se realizarán los pagos. Agrega el siguiente código:  
```HTML
​<script type="text/javascript" src="http://public.openpay.mx/openpay.v1.min.js"></script>
```
###Configuración
Antes de poder utilizar Openpay.js es necesario que se configuren tanto el ID de comercio, como llave pública que fueron asignados a la cuenta. Con estos datos, Openay podrá identificar la cuenta a la que se harán  abonarán los cargos.

La configuración de ambos datos se hace con los métodos **OpenPay.setId()** y **OpenPay.setApiKey()**, respectivamente:
```javascript
OpenPay.setId('MERCHANT_ID');
OpenPay.setApiKey('PUBLIC_API_KEY');
```
|Notas:|
|:------|
|* Tanto el MERCHANT-ID como el PUBLIC_API_KEY, los puedes obtener de la página de inicio de tu cuenta en el sitio de Openpay.|
|* Nunca debes utilizar tu llave privada con está librería, debido a que es visible del lado del cliente.|
###Modo Sandbox
Cuando se está realizando la implementacion es posible que se desee hacer pruebas antes de que se hagan cobros normales a una tarjeta de crédito, para ello es posible utilizar el método **OpenPay.setSandboxMode()** el cual nos ayudará a activar o desactivar el modo sandbox (prueba) en las peticiones que se hagan con OpenPay.js
```javascript
OpenPay.setSandboxMode(FLAG);
```
El método recibe como parámetro una bandera true/false para activar o desactivar el modo de pruebas. Si es necesario, se puede utilizar el método OpenPay.getSandboxMode() para determinar el estatus del modo Sandbox en cualquier momento:
```javascript
OpenPay.getSandboxMode(); // TRUE/FALSE, dependiendo si el modo está activado o no.
```
###Procesamiento de cargos
Para realizar un cargo es necesario hacer una llamada al método **OpenPay.card.charge()**:
```javascript
​​OpenPay.card.charge(CHARGE_PARAMETERS_OBJECT, SUCCESS_CALLBACK, ERROR_CALLBACK);
```
####Ejemplo de petición:
```javascript
OpenPay.card.charge({
   "amount":100.0,
   "description":"ebooks",
   "order_id":"10",
   "method":"card",
   "card":{
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
   }
}, onSuccess, onError);
```
El primer parámetro es un objeto Javascript que contiene la información del cargo, mientras que el segundo y tercer parámetros definen las funciones que se llamarán en caso de que la transacción haya sido correcta o haya fallado (respectivamente).
La definición del objecto cargo la encontrarás [aquí](http://docs.openpay.mx/#cargos).

###Creacion de tarjetas
Para crear una tarjeta es necesario hacer una llamada al método **OpenPay.card.create()**:
```javascript
​​OpenPay.card.create(CREATE_PARAMETERS_OBJECT, SUCCESS_CALLBACK, ERROR_CALLBACK);
```

|Notas|
|:----|
|* Con este metodo podras crear tarjetas tanto a nivel de comercio como a nivel de tus clientes.|
|* El CLIENTE-ID, se puede consultar en el dashboard dentro del listado clientes.|
####Ejemplo de creación de tarjeta a nivel de comercio:
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
####Ejemplo de creación de tarjeta a nivel de cliente:
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
El primer parámetro es un objeto Javascript que contiene la información de la tarjeta, mientras que el segundo y tercer parámetros definen las funciones que se llamarán en caso de que la operacion haya sido correcta o haya fallado (respectivamente).
La definición del objeto card la encontrarás [aquí](http://docs.openpay.mx/#tarjetas).

###Funciones de respuesta
Las funciones de respuesta sirven como manejadores del resultado de la transacción. Son funciones simples de Javascript pero que reciben argumentos con un formato predeterminado.

| Notas |
| :------------- |
|* Aunque las funciones de respuesta son opcionales, recomendamos que se implementen para que el resultado de la transacción pueda ser monitoreado en la página web. |
####SuccessCallback
Esta función es llamada cuando la transacción fue exitosa de principio a fin. Recibe un solo parámetro que es un objeto Javascript con los datos de la [transacción](http://docs.openpay.mx/#api-referencia$objeto-transacción).
Ejemplo completo de implementación de una función SuccessCallback:
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
Ejemplo del objeto transacciòn:
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
####ErrorCallback
Esta función se ejecutará cada vez que una transacción haya fallado (por cualquier circunstancia, antes o después de enviar la petición). Al igual que el **SuccessCallback()**, recibe un solo parámetro que es un objeto Javascript con el detalle del fallo.

Los campos que definen el objeto Javascript de respuesta se describen a continuación:

Los campos del objeto de respuesta se describen a continuación:

|Campo|Formato|Descripciòn|
| -------- | --------- | --------- |
|status|Integer|Describe el status HTTP de la transacción. En caso de que se produzca un error antes de enviar la petición, el status será igual a cero.|
|message|String|Descripción corta del error que ha ocurrido. Puede ser uno de los siguientes valores: "Unknown error", "Request error", "Response error (Unknown final status)", "Empty or invalid OpenPay ID", "Empty or invalid API Key", "Browser error", "Timeout after X milliseconds".|
|data|Objeto|Contiene un [Objeto Error](http://docs.openpay.mx/#errores) con la información del error en la transacción proporcionada por el servidor de OpenPay.|

Ejemplo completo de implementación de una función ErrorCallback:
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
Ejemplo de mensaje ErrorCallBack:
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
###Tipos de error en la petición
Además del campo status que guarda el estado de la transacción, es posible determinar el error que haya  sucedido por medio del campo message. El mensaje puede ser uno de los siguientes:

* **"Empty or invalid OpenPay ID"**:  Sucede cuando no se ha configurado correctamente el ID de usuario con el método OpenPay.setId() 
* **"Empty or invalid API Key"**:  Al igual que el error anterior, sucede cuando no se ha configurado el API Key con el método OpenPay.setApiKey()
* **"Browser error"**: Es disparado cuando hay un error en el navegador que impide que la petición se realice correctamente. Puede provocarse por caracterísiticas que son necesarias para ejecutar cierto código y que están faltantes en el navegador. Para mayor información consulta la sección "Compatibilidad y requerimientos". 
* **"Request error"**: Este error indica que hubo un error en el servidor de Openpay. Puede deberse a parámetros faltantes, formatos u algún otro problema que impide realizar correctamente la transacción.  
* **"Response error (Unknown final status)"**: Cuando se genera este error, quiere decir que la petición de transacción fue enviada correctamente al servidor de Openpay pero no se recibió ninguna respuesta. Es posible que esto se deba a un problema en Openpay. Para mayor información contacta a OpenPay.
* **"Timeout after X milliseconds"**: Se lanza cuando la petición ha tardado mucho tiempo en ejecutarse y, por tanto, expira el tiempo de respuesta.
* **"Unknown error"**: Se genera cuando existe algún error desconocido que impide que la petición se realice. Puede ser por problemas en el navegador o de conectividad.

##Funciones de validación de número de tarjeta
Además de las funciones para procesar cargos por tarjeta, Openpay.js también incluye algunas funciones para validad los principales datos que son necesarios para llevar a cabo la transacción, sobre todo los referentes a los números de tarjeta. 

Los métodos disponibles son:

* `OpenPay.card.validateCardNumber()`
* `OpenPay.card.validateCVC()`
* `OpenPay.card.validateExpiry()`
* `OpenPay.card.cardType()`

###Validación de número de tarjeta
Para realizar la validación de un número de tarjeta es posible utilizar el método **OpenPay.card.validateCardNumber()**.

Este método recibe como parámetro un String con el número de tarjeta que se validará y regresar un true/false en caso de que se trate de un número de tarjeta válido y sea aceptado por Openpay. Ejemplo:
```javascript
OpenPay.card.validateCardNumber('5555555555554444);
```
Este método es muy útil para determinar si un número de tarjeta es válido y si es candidato para utilizarse con Openpay, por eso recomendamos que se use sistemáticamente antes de intentar un cobro con tarjeta.

Ejemplos:
```javascript
OpenPay.card.validateCardNumber('5555555555554444'); // TRUE. Número de tarjeta válido y aceptado por OpenPay (MASTERCARD)

OpenPay.card.validateCardNumber('378282246310005'); // FALSE. Número de tarjeta válido pero no aceptado por OpenPay (AMEX)
```
###Validación de Código de Seguridad
Para validar un código de seguridad se utiliza el método **OpenPay.card.validateCVC()**.

Este método recibe como parámetro un String y devuelve true/false en caso de que la cadena sea válida. Ejemplo:
```javascript
OpenPay.card.validateCVC('123'); // válido
OpenPay.card.validateCVC('1234'); // válido
OpenPay.card.validateCVC('A23'); // inválido
```
###Validación de fecha de expiración
Para este propósito se utiliza el método **OpenPay.card.validateExpiry()**.

Recibe como parámetros dos Strings que representan el mes y año de expiración de la tarjeta. Devuelve true/false cuando la combinación de ambos datos, mes y año, determinan una fecha de expiración válida. Ejemplo:
```javascript
OpenPay.card.validateExpiry('01', '2013'); // inválido
OpenPay.card.validateExpiry('05', '2015'); // válido
```

Tipo de tarjeta
Es posible determinar (en la mayoría de las veces,) el tipo de tarjeta al que pertenece un número de tarjeta. Para eso, se utiliza el método **OpenPay.card.cardType()**.

El método recibe como parámetro un número de tarjeta y devuelve un String con el nombre del tipo de tarjeta. Ejemplos:
```javascript
OpenPay.card.cardType('5555555555554444'); // Mastercard
​OpenPay.card.cardType('4111111111111111'); //​ Visa
OpenPay.card.cardType('4917300800000000'); // Visa Electron
OpenPay.card.cardType('378282246310005'); // American Express
OpenPay.card.cardType('30569309025904'); // Diners Club Carte Blanche
OpenPay.card.cardType('6011111111111117'); // Discover
OpenPay.card.cardType('3530111333300000'); // JCB
```
##Compatibilidad y requerimientos
Para utilizar Openpay.js es necesario contar con uno de los siguientes navegadores:

* Chrome 29.0+
* Firefox 23.0+
* Safari 5.1+
* Opera 17.0+
* iOS Safari 4.0+
* Android Browser 2.1+
* Blackberry Browser 7.0+
* IE Mobile 10.0

Los navegadores deben de contar con soporte para las librerías XMLHttpRequest y JSON Parser.
