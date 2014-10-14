(function() {
    var INSTANCE, r, s = {}.hasOwnProperty, addProperty = function(_parent, _property) {
        function r() {
            this.constructor = _property;
        }
        for (var n in _parent) {
            s.call(_parent, n) && (_property[n] = _parent[n]);
        }
        return r.prototype = _parent.prototype, _property.prototype = new r(), _property.__super__ = _parent.prototype, 
        _property;
    }, CALLER = this;
    this.OpenPay = function() {
        function _openpay() {}
        return _openpay.version = 1,
        _openpay.sandboxMode = false,
        _openpay.developMode = false,
        _openpay.hostname = "https://api.openpay.mx/v1/",
        _openpay.sandboxHostname = "https://sandbox-api.openpay.mx/v1/",
        _openpay.developHostname = "https://dev-api.openpay.mx/v1/",
        _openpay.setSandboxMode = function(f) {
            _openpay.sandboxMode = (f ? true : false);
            if(f){
                _openpay.developMode = false;
            }
        },
        _openpay.getSandboxMode = function() {
            return _openpay.sandboxMode;
        },
        _openpay.setDevelopMode = function(f) {
            _openpay.developMode = (f ? true : false);
            if(f){
                _openpay.sandboxMode = false;
            }
        },
        _openpay.getDevelopMode = function() {
            return _openpay.developMode;
        },
        _openpay.setId = function(t) {
            _openpay.id = t;
        },
        _openpay.setApiKey = function(t) {
            _openpay.key = t;
        },
        _openpay.log = function(_message) {
            if (typeof _message === 'object' && 'toString' in _message) {
                _message = _message.toString();
            }
            if (typeof console !== 'undefined' && 'log' in console) {
                console.log(_message);
            }
        },
        _openpay.validate = function(_dictionary, _type) {
            if (!_dictionary) throw _type + ' required';
            if (typeof _dictionary !== 'object') throw _type + ' invalid';
        },
        _openpay.formatData = function(_dictionary, _validAttributes) {
            return _dictionary;
        },
        _openpay.extractFormInfo = function(form){
            var cardFields, objectCard, objectAddress,addressFields;
            
            var extractForm = function (object) {
                if (window.jQuery && object instanceof jQuery) {
                  return object[0];
                } else if (object.nodeType && object.nodeType === 1) {
                  return object;
                } else {
                  return document.getElementById(object);
                }
              };
            
              var findInputsData = function (element, attributeName) {
                    var found = [],
                        children = element.children,
                        child, i;

                    for (i = 0; i < children.length; i++) {
                      child = children[i];

                      if (child.nodeType === 1 && child.attributes[attributeName]) {
                        found.push(child);
                      } else if (child.children.length > 0) {
                        found = found.concat(findInputsData(child, attributeName));
                      }
                    }

                    return found;
                  };
              
              var createObject = function (element, attributeName) {
                  var object = {};

                  for (var i = 0; i < element.length; i++) {
                    fieldName = element[i].attributes[attributeName].value;
                    inputValue=element[i].value;
                    if(object[fieldName] !== undefined){
                        if (!object[fieldName].push) {
                             object[this.name] = [object[this.name]];
                        }
                        object[fieldName].push(inputValue || '');
                    } else {
                        object[fieldName] = inputValue || '';
                    }
                  }

                  return object;
                };
            
            form = extractForm(form);
            cardFields = findInputsData(form, 'data-openpay-card');
            objectCard = createObject(cardFields, 'data-openpay-card');
            addressFields = findInputsData(form, 'data-openpay-card-address');
            if(addressFields!== undefined && addressFields.length && addressFields.length > 0){
                objectAddress = createObject(addressFields, 'data-openpay-card-address');
                if(objectAddress!== undefined){
                    objectCard["address"] = objectAddress;
                }
            }
            return objectCard;
        },
        _openpay.send = function(_endpoint, _data, _success, _failure) {
            var _rhr = null, _timer = null, _url = '', _payload = '', _headers = {}, _timeout = 0, _auth = '';

            function makeBaseAuth(user) {
              var tok = user + ':';
              var hash = btoa(tok);
              return hash;
            };
            
            function handleError(_message, _status, _responseText) {
                clearTimeout(_timer);
                var _data = null;
                _message = _message || 'Unknown error';
                _status = _status || 0;
                _responseText = _responseText || '{}';
                try {
                    _data = JSON.parse(_responseText);
                } catch (e) {
                    _message = 'Response error';
                }
                _failure({
                    message: _message,
                    status: _status,
                    data: _data,
                    toString: function(){
                        return this.message + ' [status ' + this.status + ']';
                    }
                });
            };

            if (typeof _openpay.id === 'undefined' || !(/^[a-z0-9]+$/i.test(_openpay.id)) ) {
                handleError('Empty or invalid OpenPay ID');
                return;
            }
            if (typeof _openpay.key === 'undefined' || !(/^pk_[a-z0-9]+$/i.test(_openpay.key))) {
                handleError('Empty or invalid OpenPay API Key');
                return;
            }
            if (typeof _success !== "function") {
                _success = _openpay.log;
            }
            if (typeof _failure !== "function") {
                _failure = _openpay.log;
            }

            if (typeof JSON === 'undefined') {
                handleError('Browser error (JSON library not found)');
                return;
            }
            
            _timeout = 4e4;
            _auth = makeBaseAuth(_openpay.key);
            if(_openpay.sandboxMode) {
                _url=_openpay.sandboxHostname;
            } else if(_openpay.developMode){
                _url= _openpay.developHostname;
            } else {
                _url = _openpay.hostname;
            }
            _url = _url + _openpay.id + '/' + _endpoint;


            if (typeof XDomainRequest !== 'undefined') {
                   // implement jsonp
                   _data.apiKey = _auth;
                   var handleResponse = function(data){
                    if(data.error){
                        handleError('Request error', data.httpStatus, JSON.stringify(data));
                    } else {
                        try {
                            _success({
                                data: data.data,
                                status: 200
                            });
                        } catch (e) {
                            handleError('Response error (Unknown final status)', data.httpStatus, '{}');
                        }
                    }
                   };
                   var request = {
                    callbackName:"getResultData",
                    onSuccess:handleResponse,
                    onError:handleError,
                    timeout:_timeout,
                    url:_url + '/jsonp',
                    data:_data
                   };
                   $jsonp.send(request);
            } else {

                /*
         * Get XmlHttpRequest object for CORS support
         */
                function getXhr(){
                     if (isHostMethod(window, "XMLHttpRequest")) {
                        return new XMLHttpRequest();
                    }
                };

                 /*
             * From
             * http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
             */
                function isHostMethod(object, property){
                    var t = typeof object[property];
                    return t == 'function' ||
                    (!!(t == 'object' && object[property])) ||
                    t == 'unknown';
                };

                function handleResponse(){
                    // handle only if request has finished
                    if (typeof _rhr.readyState !== 'undefined' && _rhr.readyState == 4 || typeof XDomainRequest !== 'undefined') {
                        clearTimeout(_timer);
                        
                        if (_rhr.status < 200 || _rhr.status >= 300) {
                            handleError('Request error', _rhr.status, _rhr.responseText);
                        } else {
                            try {
                                _success({
                                    data: JSON.parse(_rhr.responseText),
                                    status: 200
                                });
                            } catch (e) {
                                handleError('Response error (Unknown final status)', _rhr.status, '{}');
                            }
                        }
                    }
                };

                if (!(_rhr = getXhr())) {
                    handleError('Browser error (CORS not supported)');
                    return;
                }
                _payload = JSON.stringify(_data);
                _headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' +  _auth
                };
                

                _rhr.open('POST', _url, true);

                // set the Credentials flag request header only if there is no
        // XHR2 features
                // must be set after opening the request to an
        // InvalidOperationException in IE
                if ('withCredentials' in _rhr) {
                    _rhr.withCredentials = true;
                }

                // apply the request headers
                for (var prop in _headers) {
                    if (_headers.hasOwnProperty(prop) && _headers[prop]) {
                        if ('setRequestHeader' in _rhr) {
                            _rhr.setRequestHeader(prop, _headers[prop]);
                        }
                    }
                }
                
                // define the onreadystate handler
                if ('onreadystatechange' in _rhr) {
                    _rhr.onreadystatechange = handleResponse;
                } else  if ('onload' in _rhr && 'onerror' in _rhr) {
                    _rhr.onload = handleResponse;
                    _rhr.onerror = handleError;
                }
                
                // set a timeout
                _timer = setTimeout(function(){
                    // reset the handler
                    if ('onload' in _rhr) {
                        _rhr.onload = Function.prototype;
                    } else {
                        _rhr.onreadystatechange = Function.prototype;
                    }
                    _rhr.abort();
                    _rhr = null;
                    handleError('Timeout after ' + _timeout + ' milliseconds');
                }, _timeout);
                
                // make the request
                _rhr.send(_payload);
            }



           
        },
        _openpay;

    }.call(this),
    INSTANCE = this.OpenPay,
    this.OpenPay.card = function(_parent) {
        function _card() {
            return _card.__super__.constructor.apply(this, arguments);
        }
        return addProperty(_parent, _card),  
        _card.validateCardNumber = function(_number) {
            return _number = (_number + "").replace(/\s+|-/g, ""), /^\d+$/.test(_number) && _number.length >= 10 && _number.length <= 16
            && _card.luhnCheck(_number) && _card.validateCardNumberLength(_number) && _card.validateAcceptCardNumber(_number);
        },
        _card.validateCVC = function(_number) {
            return _number = INSTANCE.utils.trim(_number), /^\d+$/.test(_number) && _number.length >= 3 && _number.length <= 4;
        },
        _card.validateExpiry = function(_month, _year) {
            var r, i;
            return _month = INSTANCE.utils.trim(_month), _year = INSTANCE.utils.trim(_year), /^\d+$/.test(_month) ? /^\d+$/.test(_year) ? parseInt(_month, 10) <= 12 ? (i = new Date(_year, _month), 
            r = new Date(), i.setMonth(i.getMonth() - 1), i.setMonth(i.getMonth() + 1, 1), i > r) : !1 : !1 : !1;
        },
        _card.validateCardNumberLength = function(_number) {
            var _cardObj = null;
            if (_cardObj = _card.cardAbstract(_number)) {
                var _i = _cardObj.length.length;
                while (_i--) {
                    if (_cardObj.length[_i] == _number.length) {
                        return true;
                    }
                }
            }
            return false;
        },
        _card.validateAcceptCardNumber = function(_number) {
            var _cardObj = null;
            if (_cardObj = _card.cardAbstract(_number)) {
                return _cardObj.accept;
            }
            return false;
        },
        _card.luhnCheck = function(_number) {
            var n = (_number + "").split(""), digit = 0, sum = parseInt(n[_number.length - 1]);
            for (var index = n.length - 2, i = 1; index >= 0; index--, i++) {
                digit = parseInt(n[index]);
                if (i % 2 != 0) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }
                sum += digit;
            }
            return sum % 10 == 0;
        },
        _card.cardType = function(_number) {
            var _cardObj = null;
            if (_cardObj = _card.cardAbstract(_number)) {
                return _cardObj.name;
            }
            return '';
        },
        _card.cardTypes = function() {
            return {
                'visa_electron': {
                    'name': "Visa Electron",
                    'regx': /^(4026|417500|4508|4844|491(3|7))/,
                    'length': [ 16 ],
                    'accept': true
                },
                'visa': {
                    'name': "Visa",
                    'regx': /^4/,
                    'length': [ 16 ],
                    'accept': true
                },
                'mastercard': {
                    'name': "Mastercard",
                    'regx': /^5[1-5]/,
                    'length': [ 16 ],
                    'accept': true
                },
                'amex': {
                    'name': 'American Express',
                    'regx': /^3[47]/,
                    'length': [ 15 ],
                    'accept': true
                },
                'diners_cb': {
                    'name': "Diners Club Carte Blanche",
                    'regx': /^30[0-5]/,
                    'length': [ 14 ],
                    'accept': false
                },
                'diners_int': {
                    'name': "Diners Club International",
                    'regx': /^36/,
                    'length': [ 14 ],
                    'accept': false
                }, 
                'jcb': {
                    'name': "JCB",
                    'regx': /^35(2[89]|[3-8][0-9])/,
                    'length': [ 16 ],
                    'accept': false
                },
                'laser': {
                    'name': "Laser",
                    'regx': /^(6304|670[69]|6771)/,
                    'length': [ 16, 17, 18, 19 ],
                    'accept': false
                },
                'maestro': {
                    'name': "Maestro",
                    'regx': /^(5018|5020|5038|6304|6759|676[1-3])/,
                    'length': [ 12, 13, 14, 15, 16, 17, 18, 19 ],
                    'accept': false
                },
                'discover': {
                    'name': "Discover",
                    'regx': /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
                    'length': [ 16 ],
                    'accept': false
                }
            };
        },
        _card.cardAbstract = function(_number) {
            var _cardTypes = {};
            _cardTypes = _card.cardTypes();
            for (var _key in _cardTypes) {
                _cardObj = _cardTypes[_key];
                if (_number.match(_cardObj.regx)) {
                    return _cardObj;
                }
            }
            return false;
        },
        _card;
        
    }.call(this, this.OpenPay),
    // Inicio seccion token
    this.OpenPay.token = function(_parent){
        function _token(){
            return _token.__super__.constructor.apply(this, arguments);
        }
        return addProperty(_parent, _token),
        _token.whitelistedAttrs = [ "card_number", "holder_name", "cvv2", "expiration_month", "expiration_year", "address" ], 
        _token.extractFormAndCreate = function(_form, _success, _failure, _customerId){
            var _params = INSTANCE.extractFormInfo(_form);
            return _token.create(_params, _success, _failure);
        },
        _token.create = function(_params, _success, _failure) {
            var _endpoint = 'tokens';
            return INSTANCE.validate(_params, "tarjeta"), INSTANCE.formatData(_params, _token.whitelistedAttrs), INSTANCE.send(_endpoint, _params, _success, _failure);
        }, _token;
    }.call(this, this.OpenPay),
    // fin seccion token
    this.OpenPay.utils = function(_parent) {
        function _utils() {}
        return addProperty(_parent, _utils),
        _utils.trim = function(e) {
            return (e + "").replace(/^\s+|\s+$/g, "");
        },
        _utils.underscore = function(e) {
            return (e + "").replace(/([A-Z])/g, function(e) {
                return "_" + e.toLowerCase();
            }).replace(/-/g, "_");
        },
        _utils.underscoreKeys = function(e) {
            var n, r;
            r = [];
            for (var t in e) n = e[t], delete e[t], r.push(e[this.underscore(t)] = n);
            return r;
        },
        _utils.isElement = function(e) {
            return typeof e != "object" ? !1 : typeof jQuery != "undefined" && jQuery !== null && e instanceof jQuery ? !0 : e.nodeType === 1;
        }, _utils;
    }.call(this, this.OpenPay),

    typeof module != "undefined" && module !== null && (module.exports = this.OpenPay), 
    typeof define == "function" && define("openpay", [], function() {
        return CALLER.OpenPay;
    });
}).call(this);

/*
 * Copyright (c) 2010 Nick Galbreath
 * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * base64 encode/decode compatible with window.btoa/atob
 * 
 * window.atob/btoa is a Firefox extension to convert binary data (the "b") to
 * base64 (ascii, the "a").
 * 
 * It is also found in Safari and Chrome. It is not available in IE.
 * 
 * if (!window.btoa) window.btoa = base64.encode if (!window.atob) window.atob =
 * base64.decode
 * 
 * The original spec's for atob/btoa are a bit lacking
 * https://developer.mozilla.org/en/DOM/window.atob
 * https://developer.mozilla.org/en/DOM/window.btoa
 * 
 * window.btoa and base64.encode takes a string where charCodeAt is [0,255] If
 * any character is not [0,255], then an DOMException(5) is thrown.
 * 
 * window.atob and base64.decode take a base64-encoded string If the input
 * length is not a multiple of 4, or contains invalid characters then an
 * DOMException(5) is thrown.
 */
var base64 = {};
base64.PADCHAR = '=';
base64.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

base64.makeDOMException = function() {
    // sadly in FF,Safari,Chrome you can't make a DOMException
    var e, tmp;

    try {
        return new DOMException(DOMException.INVALID_CHARACTER_ERR);
    } catch (tmp) {
        // not available, just passback a duck-typed equiv
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
        var ex = new Error("DOM Exception 5");

        // ex.number and ex.description is IE-specific.
        ex.code = ex.number = 5;
        ex.name = ex.description = "INVALID_CHARACTER_ERR";

        // Safari/Chrome output format
        ex.toString = function() { return 'Error: ' + ex.name + ': ' + ex.message; };
        return ex;
    }
}

base64.getbyte64 = function(s,i) {
    // This is oddly fast, except on Chrome/V8.
    // Minimal or no improvement in performance by using a
    // object with properties mapping chars to value (eg. 'A': 0)
    var idx = base64.ALPHA.indexOf(s.charAt(i));
    if (idx === -1) {
        throw base64.makeDOMException();
    }
    return idx;
}

base64.decode = function(s) {
    // convert to string
    s = '' + s;
    var getbyte64 = base64.getbyte64;
    var pads, i, b10;
    var imax = s.length
    if (imax === 0) {
        return s;
    }

    if (imax % 4 !== 0) {
        throw base64.makeDOMException();
    }

    pads = 0
    if (s.charAt(imax - 1) === base64.PADCHAR) {
        pads = 1;
        if (s.charAt(imax - 2) === base64.PADCHAR) {
            pads = 2;
        }
        // either way, we want to ignore this last block
        imax -= 4;
    }

    var x = [];
    for (i = 0; i < imax; i += 4) {
        b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) |
            (getbyte64(s,i+2) << 6) | getbyte64(s,i+3);
        x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
    }

    switch (pads) {
    case 1:
        b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) | (getbyte64(s,i+2) << 6);
        x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
        break;
    case 2:
        b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12);
        x.push(String.fromCharCode(b10 >> 16));
        break;
    }
    return x.join('');
}

base64.getbyte = function(s,i) {
    var x = s.charCodeAt(i);
    if (x > 255) {
        throw base64.makeDOMException();
    }
    return x;
}

base64.encode = function(s) {
    if (arguments.length !== 1) {
        throw new SyntaxError("Not enough arguments");
    }
    var padchar = base64.PADCHAR;
    var alpha   = base64.ALPHA;
    var getbyte = base64.getbyte;

    var i, b10;
    var x = [];

    // convert to string
    s = '' + s;

    var imax = s.length - s.length % 3;

    if (s.length === 0) {
        return s;
    }
    for (i = 0; i < imax; i += 3) {
        b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8) | getbyte(s,i+2);
        x.push(alpha.charAt(b10 >> 18));
        x.push(alpha.charAt((b10 >> 12) & 0x3F));
        x.push(alpha.charAt((b10 >> 6) & 0x3f));
        x.push(alpha.charAt(b10 & 0x3f));
    }
    switch (s.length - imax) {
    case 1:
        b10 = getbyte(s,i) << 16;
        x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
               padchar + padchar);
        break;
    case 2:
        b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8);
        x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
               alpha.charAt((b10 >> 6) & 0x3f) + padchar);
        break;
    }
    return x.join('');
};

(function (){
    if (!window.btoa) {
        window.btoa = base64.encode
    }
    if (!window.atob){
        window.atob = base64.decode
    } 
 })();

 /* jsonp.js, (c) Przemek Sobstel 2012, License: MIT */

var $jsonp = (function(){
  var that = {};

  that.send = function(request) {
      var requestID = new Date().getTime();
    var callbackName = request.callbackName || 'callback',
      on_success = request.onSuccess || function(){},
      on_error = request.onError || function(){},
      timeout = request.timeout || 4000,
      url = request.url || '',
      data = request.data || {}
      dataIdName = "idData";
    var e = encodeURIComponent;
    data.callback = "var "+dataIdName+"="+ (++requestID)+";"+callbackName;
    window[dataIdName]=undefined;
    var toCamelCase = function(string) {
        string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
        return string.replace(/^([A-Z])/, function(match, chr) {
            return chr ? chr.toLowerCase() : '';
        });
    };
    
    var serializeData = function(object, result, scope) {
        var key, value;
        
        if (result == null) {
          result = [];
        }
        for (key in object) {
          value = object[key];
          if (scope) {
            key = "" + scope + "." + key;
          }
          if (typeof value === 'object') {
              serializeData(value, result, key);
          } else {
            result.push(toCamelCase(""+ key) + "=" + (e(value)));
          }
        }
        return result.join('&').replace(/%20/g, '+');
      };
              
    timeout_trigger = window.setTimeout(function(){
      window[callbackName] = function(){};
      on_error('Timeout after ' + timeout + ' milliseconds');
    }, timeout );
    
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url + '?' + serializeData(data);
    
    var removeScript = function(){
    var _ref;
          if ((_ref = script.parentNode) != null) {
              _ref.removeChild(script);
            }
    };
    
    var abort = function(){
    window.clearTimeout(timeout_trigger);
        removeScript();
        on_error("There was an error, please verify your authentication data or conection.");
    };
    
    if ('onreadystatechange' in script) {
    script.onreadystatechange=function(){
        if(script.readyState == "loaded"){
        if (typeof window[dataIdName] === "undefined") {
            abort();
        }
        }
    };
    } else if ('onerror' in script) {
        script.onerror= function(){
            abort();
        };
        }
    
    window[callbackName] = function(data){
      window.clearTimeout(timeout_trigger);
      removeScript();
      on_success(data);
    };
    document.getElementsByTagName('head')[0].appendChild(script);
  };

  return that;
})();