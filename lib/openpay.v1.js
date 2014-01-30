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

            /* 
             * From http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
             */
            function isHostMethod(object, property){
                var t = typeof object[property];
                return t == 'function' ||
                (!!(t == 'object' && object[property])) ||
                t == 'unknown';
            };
            
            function makeBaseAuth(user) {
              var tok = user + ':';
              var hash = btoa(tok);
              return hash;
            };
            
            /*
             * Get XmlHttpRequest object for CORS support
             */
            function getXhr(){
                if (typeof XDomainRequest !== 'undefined') {
                    return new XDomainRequest();
                } else if (isHostMethod(window, "XMLHttpRequest")) {
                    return new XMLHttpRequest();
                }
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
                                status: 200,
                            });
                        } catch (e) {
                            handleError('Response error (Unknown final status)', _rhr.status, '{}');
                        }
                    }
                }
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
            if (!(_rhr = getXhr())) {
                handleError('Browser error (CORS not supported)');
                return;
            }
            
            _auth = makeBaseAuth(_openpay.key);
            if(_openpay.sandboxMode) {
                _url=_openpay.sandboxHostname;
            } else if(_openpay.developMode){
                _url= _openpay.developHostname;
            } else {
                _url = _openpay.hostname;
            }
            _url = _url + _openpay.id + '/' + _endpoint;
            _payload = JSON.stringify(_data);
            _headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' +  _auth
            };
            _timeout = 4e4;
            
            // set the Credentials flag request header only if there is no XHR2 features
            if ('withCredentials' in _rhr) {
                _rhr.withCredentials = true;
            }
            _rhr.open('POST', _url, true);

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
        },
        _openpay;

    }.call(this),
    INSTANCE = this.OpenPay,
    this.OpenPay.card = function(_parent) {
        function _card() {
            return _card.__super__.constructor.apply(this, arguments);
        }
        return addProperty(_parent, _card),
        _card.whitelistedAttrs = [ "card_number", "holder_name", "cvv2", "expiration_month", "expiration_year", "address" ], 
        _card.extractFormAndCreate = function(_form, _success, _failure, _customerId){
        	var _params = INSTANCE.extractFormInfo(_form);
        	return _card.create(_params, _success, _failure, _customerId);
        },
        _card.create = function(_params, _success, _failure, _customerId) {
            var _customerEndpoint = 'cards';
            if (typeof _customerId !== 'undefined' && _customerId !== ''){
                _customerEndpoint = 'customers/' + _customerId + '/cards';
            }
            return INSTANCE.validate(_params, "tarjeta"), INSTANCE.formatData(_params, _card.whitelistedAttrs), INSTANCE.send(_customerEndpoint, _params, _success, _failure);
        },
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
            var t, n, r, i, s, o;
            r = !0, i = 0, n = (_number + "").split("").reverse();
            for (s = 0, o = _card.length; s < o; s++) {
                t = n[s], t = parseInt(t, 10);
                if (r = !r) t *= 2;
                t > 9 && (t -= 9), i += t;
            }
            return i % 10 === 0;
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
                    'accept': false
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