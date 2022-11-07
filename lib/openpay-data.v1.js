//"use strict";

(function(){
  var _deviceData = function() {};
  var _deviceDataSC = function() {};
  var _getBeaconKey = function() {};
  _deviceData._hostname = "https://production-api.openpayargentina.com.ar/";
  _deviceData._sandboxHostname = "https://sandbox-api.openpayargentina.com.ar/";
  _deviceData._developHostname = "https://dev-api.openpayargentina.com.ar/";
  _deviceData._deviceDataId = undefined;

  /* Get current deviceDataId or generate new one */
  function getDeviceDataId() {
    if (_deviceData._deviceDataId === undefined) {
      _deviceData._deviceDataId = sjcl.codec.base64.fromBits(sjcl.random.randomWords(6, 0)).replace(/[\+\/]/g,'0');
    }
    return _deviceData._deviceDataId;
  }


  /* GET ANTI-FRAUD COMPONENTS */
  function get_antifraud_comp(hostname, merchant, sessionId){
    var antifraudURL = hostname+'antifraud/'+merchant+'/components?s='+sessionId;

    if (window.XDomainRequest) {
        var xdr = new XDomainRequest();
        xdr.open("GET", antifraudURL);
        xdr.onload = function() {
          document.body.insertAdjacentHTML("beforeend",xdr.responseText);
        }
        setTimeout(function () {xdr.send();}, 0);
    }else{
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function(){
            if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
                document.body.insertAdjacentHTML("beforeend",xmlhttp.responseText);
            }
        }
        xmlhttp.open('GET', antifraudURL , true);
        xmlhttp.send();
    }

  }

  /* Collect device data */
  function collect() {
      var hostname;
      var sessionId = getDeviceDataId();

      if (OpenPay.developMode) {
          hostname = _deviceData._developHostname;
      } else if (OpenPay.sandboxMode) {
          hostname = _deviceData._sandboxHostname;
      } else {
          hostname = _deviceData._hostname;
      }

      var merchant = OpenPay.getId();
      get_antifraud_comp(hostname,merchant,sessionId);

      return getDeviceDataId();
  }

   /* Collect device data, and add a hidden field to the form with the given ID if specified. */
  _deviceData['setup'] = function(_formId, _hiddenFieldName) {
  	var sessionId = getDeviceDataId();
    if(_formId && document.getElementById(_formId)){
      var input = document.createElement("input");
      input.setAttribute('type', 'hidden');
      input.value = sessionId;
      input.name = _hiddenFieldName ? _hiddenFieldName : 'deviceDataId';
      input.id = _hiddenFieldName ? _hiddenFieldName : 'deviceDataId';
      document.getElementById(_formId).appendChild(input);
    }
    var isNewLibraryOpenPay = true;

    try {
    	OpenPay.getId();
    	OpenPay.getApiKey();
	} catch (e) {
		isNewLibraryOpenPay = false;
	}

    if(isNewLibraryOpenPay){
	    console.log("executing sift mode");
	    var publicId = OpenPay.getId();
	    var apiKey = OpenPay.getApiKey();
	    var hostname;
	    if (OpenPay.developMode) {
	        hostname = _deviceData._developHostname;
	    } else if (OpenPay.sandboxMode) {
	        hostname = _deviceData._sandboxHostname;
	    } else {
	        hostname = _deviceData._hostname;
	    }
	    var url = hostname + "v1/" + publicId +"/antifraudkeys";
	    //se obtiene el beaconKey de siftscience
	    try {
	    	OpenPay.getBeaconKey.beaconKey(url, apiKey, "", sessionId,hostname);
	    } catch(e){
	    	console.log("continue without beaconkey" + e);
	    }
    }

    return collect();
  };

	_getBeaconKey['beaconKey'] = function(endpoint, publicKey, userId, sessionId, hostname) {
		var _rhr = null, _timer = null, _url = endpoint, _headers = {}, _timeout = 0, _auth = btoa(publicKey + ":");
    	var _data = {};

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
          };

          if (typeof JSON === 'undefined') {
              handleError('Browser error (JSON library not found)');
              return;
          }

         _timeout = 4e4;
          var hasCors = XMLHttpRequest && ("withCredentials" in new XMLHttpRequest());
          if(!hasCors){

            if (typeof XDomainRequest !== 'undefined') {
              // Inicia jsonp
              _data.apiKey = _auth;
              var handleResponse = function(data){
               if(data.error){
                   handleError('Request error', data.httpStatus, JSON.stringify(data));
               } else {
                   try {
          				var beaconKey = data.data;
          				console.log("beaconKey ok");
          				if(beaconKey.length > 0){
          		        	//Se lanza el script siftScience con el beaconKey obtenido
          		        	OpenPay.deviceDataSC.setupSC(userId, sessionId, beaconKey,hostname);
          				}else{
          					console.log("Empty beaconKey normal in Sandbox");
          				}
                      } catch (e) {
                          handleError('Response error (Unknown final status)', _rhr.status, '{}');
                      }
               }
              };

              var request = {
               callbackName:"getResultData",
               onSuccess:handleResponse,
               onError:handleError,
               timeout:_timeout,
               url:_url+ "/jsonp",
               data:_data
              };

              $jsonp.send(request);
              // Finaliza jsonp
            }else{
                handleError('Browser error (CORS not supported)');
               return;
            }

        } else{

        	function getXhr(){
                if (isHostMethod(window, "XMLHttpRequest")) {
                   return new XMLHttpRequest();
               }
           };

           function isHostMethod(object, property){
               var t = typeof object[property];
               return t == 'function' ||
               (!!(t == 'object' && object[property])) ||
               t == 'unknown';
           };

           function handleResponseBK(){
               // handle only if request has finished
               if (typeof _rhr.readyState !== 'undefined' && _rhr.readyState == 4 || !hasCors) {
                   clearTimeout(_timer);
                   if (_rhr.status < 200 || _rhr.status >= 300) {
                       handleError('Request error NO IE', _rhr.status, _rhr.responseText);
                   } else {
                       try {
           	        	var rt = _rhr.responseText;
           	        	rt = rt.replace("(","");
           				rt = rt.replace(")","");
           				var jsonResponse = JSON.parse(rt);
           				var beaconKey = jsonResponse.data;
           				console.log("beaconKey ok");
           				if(beaconKey.length > 0){
           		        	//Se lanza el script siftScience con el beaconKey obtenido
           		        	OpenPay.deviceDataSC.setupSC(userId, sessionId, beaconKey, hostname);
           				}else{
           					console.log("Empty beaconKey normal in Sandbox");
           				}
                       } catch (e) {
                           handleError('Response error (Unknown final status) NO IE', _rhr.status, '{}');
                       }
                   }
               }
           };

           if (!(_rhr = getXhr())) {
               handleError('Browser error (CORS not supported)');
               return;
           }

           _headers = {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json',
                   'Authorization': "Basic " +  _auth
               };

           _rhr.open('GET', _url, true);

           if ('withCredentials' in _rhr) {
               _rhr.withCredentials = true;
           }

           for (var prop in _headers) {
               if (_headers.hasOwnProperty(prop) && _headers[prop]) {
                   if ('setRequestHeader' in _rhr) {
                       _rhr.setRequestHeader(prop, _headers[prop]);
                   }
               }
           }

           if ('onreadystatechange' in _rhr) {
               _rhr.onreadystatechange = handleResponseBK;
           } else  if ('onload' in _rhr && 'onerror' in _rhr) {
               _rhr.onload = handleResponseBK;
               _rhr.onerror = handleError;
           }

           _timer = setTimeout(function(){

               if ('onload' in _rhr) {
                   _rhr.onload = Function.prototype;
               } else {
                   _rhr.onreadystatechange = Function.prototype;
               }
               _rhr.abort();
               _rhr = null;
               handleError('Timeout after ' + _timeout + ' milliseconds');
           }, _timeout);

           _rhr.send();

        }

	}

	/* Initialize the siftscience snippet for device detection */
	_deviceDataSC['setupSC'] = function(userId, sessionId, beaconKey, hostname) {
	console.log("Sift Snippet");
	  var _sift = window._sift = window._sift || [];
	  _sift.push(['_setAccount', beaconKey]);
	  _sift.push(['_setSessionId', sessionId]);
	  _sift.push(['_trackPageview']);

	  var e = document.createElement('script');
	    e.type = 'text/javascript';
	    e.async = true;
	    e.src = hostname+'antifraud/sc.js';

	    var s = document.getElementsByTagName('script')[0];
	    s.parentNode.insertBefore(e, s);
  };

  OpenPay['deviceData'] = _deviceData;

  OpenPay['getBeaconKey'] = _getBeaconKey;

  OpenPay['deviceDataSC'] = _deviceDataSC;

    /* Bundled SJCL library with modules CodecBase64 and Random */

    /*
   * Copyright 2009-2010 Emily Stark, Mike Hamburg, Dan Boneh. All rights
   * reserved. Redistribution and use in source and binary forms, with or
   * without modification, are permitted provided that the following
   * conditions are met:
   * 
   * 1. Redistributions of source code must retain the above copyright notice,
   * this list of conditions and the following disclaimer.
   * 
   * 2. Redistributions in binary form must reproduce the above copyright
   * notice, this list of conditions and the following disclaimer in the
   * documentation and/or other materials provided with the distribution.
   * 
   * THIS SOFTWARE IS PROVIDED BY THE AUTHORS ``AS IS'' AND ANY EXPRESS OR
   * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
   * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
   * IN NO EVENT SHALL <COPYRIGHT HOLDER> OR CONTRIBUTORS BE LIABLE FOR ANY
   * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
   * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
   * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
   * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
   * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
   * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   * 
   * The views and conclusions contained in the software and documentation are
   * those of the authors and should not be interpreted as representing
   * official policies, either expressed or implied, of the authors.
   */

  var sjcl = {cipher:{}, hash:{}, keyexchange:{}, mode:{}, misc:{}, codec:{}, exception:{corrupt:function(message) {
      this.toString = function() {
        return"CORRUPT: " + this.message
      };
      this.message = message
    }, invalid:function(message) {
      this.toString = function() {
        return"INVALID: " + this.message
      };
      this.message = message
    }, bug:function(message) {
      this.toString = function() {
        return"BUG: " + this.message
      };
      this.message = message
    }, notReady:function(message) {
      this.toString = function() {
        return"NOT READY: " + this.message
      };
      this.message = message
    }}};
    if(typeof module !== "undefined" && module.exports) {
      module.exports = sjcl
    }
    sjcl.cipher.aes = function(key) {
      if(!this._tables[0][0][0]) {
        this._precompute()
      }
      var i, j, tmp, encKey, decKey, sbox = this._tables[0][4], decTable = this._tables[1], keyLen = key.length, rcon = 1;
      if(keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
        throw new sjcl.exception.invalid("invalid aes key size");
      }
      this._key = [encKey = key.slice(0), decKey = []];
      for(i = keyLen;i < 4 * keyLen + 28;i++) {
        tmp = encKey[i - 1];
        if(i % keyLen === 0 || keyLen === 8 && i % keyLen === 4) {
          tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255];
          if(i % keyLen === 0) {
            tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
            rcon = rcon << 1 ^ (rcon >> 7) * 283
          }
        }
        encKey[i] = encKey[i - keyLen] ^ tmp
      }
      for(j = 0;i;j++, i--) {
        tmp = encKey[j & 3 ? i : i - 4];
        if(i <= 4 || j < 4) {
          decKey[j] = tmp
        }else {
          decKey[j] = decTable[0][sbox[tmp >>> 24]] ^ decTable[1][sbox[tmp >> 16 & 255]] ^ decTable[2][sbox[tmp >> 8 & 255]] ^ decTable[3][sbox[tmp & 255]]
        }
      }
    };
    sjcl.cipher.aes.prototype = {encrypt:function(data) {
      return this._crypt(data, 0)
    }, decrypt:function(data) {
      return this._crypt(data, 1)
    }, _tables:[[[], [], [], [], []], [[], [], [], [], []]], _precompute:function() {
      var encTable = this._tables[0], decTable = this._tables[1], sbox = encTable[4], sboxInv = decTable[4], i, x, xInv, d = [], th = [], x2, x4, x8, s, tEnc, tDec;
      for(i = 0;i < 0x100;i++) {
        th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i
      }
      for(x = xInv = 0;!sbox[x];x ^= x2 || 1, xInv = th[xInv] || 1) {
        s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
        s = s >> 8 ^ s & 255 ^ 99;
        sbox[x] = s;
        sboxInv[s] = x;
        x8 = d[x4 = d[x2 = d[x]]];
        tDec = x8 * 0x1010101 ^ x4 * 0x10001 ^ x2 * 0x101 ^ x * 0x1010100;
        tEnc = d[s] * 0x101 ^ s * 0x1010100;
        for(i = 0;i < 4;i++) {
          encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
          decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8
        }
      }
      for(i = 0;i < 5;i++) {
        encTable[i] = encTable[i].slice(0);
        decTable[i] = decTable[i].slice(0)
      }
    }, _crypt:function(input, dir) {
      if(input.length !== 4) {
        throw new sjcl.exception.invalid("invalid aes block size");
      }
      var key = this._key[dir], a = input[0] ^ key[0], b = input[dir ? 3 : 1] ^ key[1], c = input[2] ^ key[2], d = input[dir ? 1 : 3] ^ key[3], a2, b2, c2, nInnerRounds = key.length / 4 - 2, i, kIndex = 4, out = [0, 0, 0, 0], table = this._tables[dir], t0 = table[0], t1 = table[1], t2 = table[2], t3 = table[3], sbox = table[4];
      for(i = 0;i < nInnerRounds;i++) {
        a2 = t0[a >>> 24] ^ t1[b >> 16 & 255] ^ t2[c >> 8 & 255] ^ t3[d & 255] ^ key[kIndex];
        b2 = t0[b >>> 24] ^ t1[c >> 16 & 255] ^ t2[d >> 8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
        c2 = t0[c >>> 24] ^ t1[d >> 16 & 255] ^ t2[a >> 8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
        d = t0[d >>> 24] ^ t1[a >> 16 & 255] ^ t2[b >> 8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
        kIndex += 4;
        a = a2;
        b = b2;
        c = c2
      }
      for(i = 0;i < 4;i++) {
        out[dir ? 3 & -i : i] = sbox[a >>> 24] << 24 ^ sbox[b >> 16 & 255] << 16 ^ sbox[c >> 8 & 255] << 8 ^ sbox[d & 255] ^ key[kIndex++];
        a2 = a;
        a = b;
        b = c;
        c = d;
        d = a2
      }
      return out
    }};
    sjcl.bitArray = {bitSlice:function(a, bstart, bend) {
      a = sjcl.bitArray._shiftRight(a.slice(bstart / 32), 32 - (bstart & 31)).slice(1);
      return bend === undefined ? a : sjcl.bitArray.clamp(a, bend - bstart)
    }, extract:function(a, bstart, blength) {
      var x, sh = Math.floor(-bstart - blength & 31);
      if((bstart + blength - 1 ^ bstart) & -32) {
        x = a[bstart / 32 | 0] << 32 - sh ^ a[bstart / 32 + 1 | 0] >>> sh
      }else {
        x = a[bstart / 32 | 0] >>> sh
      }
      return x & (1 << blength) - 1
    }, concat:function(a1, a2) {
      if(a1.length === 0 || a2.length === 0) {
        return a1.concat(a2)
      }
      var out, i, last = a1[a1.length - 1], shift = sjcl.bitArray.getPartial(last);
      if(shift === 32) {
        return a1.concat(a2)
      }else {
        return sjcl.bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1))
      }
    }, bitLength:function(a) {
      var l = a.length, x;
      if(l === 0) {
        return 0
      }
      x = a[l - 1];
      return(l - 1) * 32 + sjcl.bitArray.getPartial(x)
    }, clamp:function(a, len) {
      if(a.length * 32 < len) {
        return a
      }
      a = a.slice(0, Math.ceil(len / 32));
      var l = a.length;
      len = len & 31;
      if(l > 0 && len) {
        a[l - 1] = sjcl.bitArray.partial(len, a[l - 1] & 2147483648 >> len - 1, 1)
      }
      return a
    }, partial:function(len, x, _end) {
      if(len === 32) {
        return x
      }
      return(_end ? x | 0 : x << 32 - len) + len * 0x10000000000
    }, getPartial:function(x) {
      return Math.round(x / 0x10000000000) || 32
    }, equal:function(a, b) {
      if(sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) {
        return false
      }
      var x = 0, i;
      for(i = 0;i < a.length;i++) {
        x |= a[i] ^ b[i]
      }
      return x === 0
    }, _shiftRight:function(a, shift, carry, out) {
      var i, last2 = 0, shift2;
      if(out === undefined) {
        out = []
      }
      for(;shift >= 32;shift -= 32) {
        out.push(carry);
        carry = 0
      }
      if(shift === 0) {
        return out.concat(a)
      }
      for(i = 0;i < a.length;i++) {
        out.push(carry | a[i] >>> shift);
        carry = a[i] << 32 - shift
      }
      last2 = a.length ? a[a.length - 1] : 0;
      shift2 = sjcl.bitArray.getPartial(last2);
      out.push(sjcl.bitArray.partial(shift + shift2 & 31, shift + shift2 > 32 ? carry : out.pop(), 1));
      return out
    }, _xor4:function(x, y) {
      return[x[0] ^ y[0], x[1] ^ y[1], x[2] ^ y[2], x[3] ^ y[3]]
    }};
    sjcl.codec.utf8String = {fromBits:function(arr) {
      var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
      for(i = 0;i < bl / 8;i++) {
        if((i & 3) === 0) {
          tmp = arr[i / 4]
        }
        out += String.fromCharCode(tmp >>> 24);
        tmp <<= 8
      }
      return decodeURIComponent(escape(out))
    }, toBits:function(str) {
      str = unescape(encodeURIComponent(str));
      var out = [], i, tmp = 0;
      for(i = 0;i < str.length;i++) {
        tmp = tmp << 8 | str.charCodeAt(i);
        if((i & 3) === 3) {
          out.push(tmp);
          tmp = 0
        }
      }
      if(i & 3) {
        out.push(sjcl.bitArray.partial(8 * (i & 3), tmp))
      }
      return out
    }};
    sjcl.codec.base64 = {_chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", fromBits:function(arr, _noEquals, _url) {
      var out = "", i, bits = 0, c = sjcl.codec.base64._chars, ta = 0, bl = sjcl.bitArray.bitLength(arr);
      if(_url) {
        c = c.substr(0, 62) + "-_"
      }
      for(i = 0;out.length * 6 < bl;) {
        out += c.charAt((ta ^ arr[i] >>> bits) >>> 26);
        if(bits < 6) {
          ta = arr[i] << 6 - bits;
          bits += 26;
          i++
        }else {
          ta <<= 6;
          bits -= 6
        }
      }
      while(out.length & 3 && !_noEquals) {
        out += "="
      }
      return out
    }, toBits:function(str, _url) {
      str = str.replace(/\s|=/g, "");
      var out = [], i, bits = 0, c = sjcl.codec.base64._chars, ta = 0, x;
      if(_url) {
        c = c.substr(0, 62) + "-_"
      }
      for(i = 0;i < str.length;i++) {
        x = c.indexOf(str.charAt(i));
        if(x < 0) {
          throw new sjcl.exception.invalid("this isn't base64!");
        }
        if(bits > 26) {
          bits -= 26;
          out.push(ta ^ x >>> bits);
          ta = x << 32 - bits
        }else {
          bits += 6;
          ta ^= x << 32 - bits
        }
      }
      if(bits & 56) {
        out.push(sjcl.bitArray.partial(bits & 56, ta, 1))
      }
      return out
    }};
    sjcl.codec.base64url = {fromBits:function(arr) {
      return sjcl.codec.base64.fromBits(arr, 1, 1)
    }, toBits:function(str) {
      return sjcl.codec.base64.toBits(str, 1)
    }};
    sjcl.hash.sha256 = function(hash) {
      if(!this._key[0]) {
        this._precompute()
      }
      if(hash) {
        this._h = hash._h.slice(0);
        this._buffer = hash._buffer.slice(0);
        this._length = hash._length
      }else {
        this.reset()
      }
    };
    sjcl.hash.sha256.hash = function(data) {
      return(new sjcl.hash.sha256).update(data).finalize()
    };
    sjcl.hash.sha256.prototype = {blockSize:512, reset:function() {
      this._h = this._init.slice(0);
      this._buffer = [];
      this._length = 0;
      return this
    }, update:function(data) {
      if(typeof data === "string") {
        data = sjcl.codec.utf8String.toBits(data)
      }
      var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
      for(i = 512 + ol & -512;i <= nl;i += 512) {
        this._block(b.splice(0, 16))
      }
      return this
    }, finalize:function() {
      var i, b = this._buffer, h = this._h;
      b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
      for(i = b.length + 2;i & 15;i++) {
        b.push(0)
      }
      b.push(Math.floor(this._length / 0x100000000));
      b.push(this._length | 0);
      while(b.length) {
        this._block(b.splice(0, 16))
      }
      this.reset();
      return h
    }, _init:[], _key:[], _precompute:function() {
      var i = 0, prime = 2, factor;
      function frac(x) {
        return(x - Math.floor(x)) * 0x100000000 | 0
      }
      outer:for(;i < 64;prime++) {
        for(factor = 2;factor * factor <= prime;factor++) {
          if(prime % factor === 0) {
            continue outer
          }
        }
        if(i < 8) {
          this._init[i] = frac(Math.pow(prime, 1 / 2))
        }
        this._key[i] = frac(Math.pow(prime, 1 / 3));
        i++
      }
    }, _block:function(words) {
      var i, tmp, a, b, w = words.slice(0), h = this._h, k = this._key, h0 = h[0], h1 = h[1], h2 = h[2], h3 = h[3], h4 = h[4], h5 = h[5], h6 = h[6], h7 = h[7];
      for(i = 0;i < 64;i++) {
        if(i < 16) {
          tmp = w[i]
        }else {
          a = w[i + 1 & 15];
          b = w[i + 14 & 15];
          tmp = w[i & 15] = (a >>> 7 ^ a >>> 18 ^ a >>> 3 ^ a << 25 ^ a << 14) + (b >>> 17 ^ b >>> 19 ^ b >>> 10 ^ b << 15 ^ b << 13) + w[i & 15] + w[i + 9 & 15] | 0
        }
        tmp = tmp + h7 + (h4 >>> 6 ^ h4 >>> 11 ^ h4 >>> 25 ^ h4 << 26 ^ h4 << 21 ^ h4 << 7) + (h6 ^ h4 & (h5 ^ h6)) + k[i];
        h7 = h6;
        h6 = h5;
        h5 = h4;
        h4 = h3 + tmp | 0;
        h3 = h2;
        h2 = h1;
        h1 = h0;
        h0 = tmp + (h1 & h2 ^ h3 & (h1 ^ h2)) + (h1 >>> 2 ^ h1 >>> 13 ^ h1 >>> 22 ^ h1 << 30 ^ h1 << 19 ^ h1 << 10) | 0
      }
      h[0] = h[0] + h0 | 0;
      h[1] = h[1] + h1 | 0;
      h[2] = h[2] + h2 | 0;
      h[3] = h[3] + h3 | 0;
      h[4] = h[4] + h4 | 0;
      h[5] = h[5] + h5 | 0;
      h[6] = h[6] + h6 | 0;
      h[7] = h[7] + h7 | 0
    }};
    sjcl.prng = function(defaultParanoia) {
      this._pools = [new sjcl.hash.sha256];
      this._poolEntropy = [0];
      this._reseedCount = 0;
      this._robins = {};
      this._eventId = 0;
      this._collectorIds = {};
      this._collectorIdNext = 0;
      this._strength = 0;
      this._poolStrength = 0;
      this._nextReseed = 0;
      this._key = [0, 0, 0, 0, 0, 0, 0, 0];
      this._counter = [0, 0, 0, 0];
      this._cipher = undefined;
      this._defaultParanoia = defaultParanoia;
      this._collectorsStarted = false;
      this._callbacks = {progress:{}, seeded:{}};
      this._callbackI = 0;
      this._NOT_READY = 0;
      this._READY = 1;
      this._REQUIRES_RESEED = 2;
      this._MAX_WORDS_PER_BURST = 0x10000;
      this._PARANOIA_LEVELS = [0, 48, 64, 96, 128, 192, 0x100, 384, 512, 768, 1024];
      this._MILLISECONDS_PER_RESEED = 3E4;
      this._BITS_PER_RESEED = 80
    };
    sjcl.prng.prototype = {randomWords:function(nwords, paranoia) {
      var out = [], i, readiness = this.isReady(paranoia), g;
      if(readiness === this._NOT_READY) {
        throw new sjcl.exception.notReady("generator isn't seeded");
      }else {
        if(readiness & this._REQUIRES_RESEED) {
          this._reseedFromPools(!(readiness & this._READY))
        }
      }
      for(i = 0;i < nwords;i += 4) {
        if((i + 1) % this._MAX_WORDS_PER_BURST === 0) {
          this._gate()
        }
        g = this._gen4words();
        out.push(g[0], g[1], g[2], g[3])
      }
      this._gate();
      return out.slice(0, nwords)
    }, setDefaultParanoia:function(paranoia, allowZeroParanoia) {
      if(paranoia === 0 && allowZeroParanoia !== "Setting paranoia=0 will ruin your security; use it only for testing") {
        throw"Setting paranoia=0 will ruin your security; use it only for testing";
      }
      this._defaultParanoia = paranoia
    }, addEntropy:function(data, estimatedEntropy, source) {
      source = source || "user";
      var id, i, tmp, t = (new Date).valueOf(), robin = this._robins[source], oldReady = this.isReady(), err = 0, objName;
      id = this._collectorIds[source];
      if(id === undefined) {
        id = this._collectorIds[source] = this._collectorIdNext++
      }
      if(robin === undefined) {
        robin = this._robins[source] = 0
      }
      this._robins[source] = (this._robins[source] + 1) % this._pools.length;
      switch(typeof data) {
        case "number":
          if(estimatedEntropy === undefined) {
            estimatedEntropy = 1
          }
          this._pools[robin].update([id, this._eventId++, 1, estimatedEntropy, t, 1, data | 0]);
          break;
        case "object":
          objName = Object.prototype.toString.call(data);
          if(objName === "[object Uint32Array]") {
            tmp = [];
            for(i = 0;i < data.length;i++) {
              tmp.push(data[i])
            }
            data = tmp
          }else {
            if(objName !== "[object Array]") {
              err = 1
            }
            for(i = 0;i < data.length && !err;i++) {
              if(typeof data[i] !== "number") {
                err = 1
              }
            }
          }
          if(!err) {
            if(estimatedEntropy === undefined) {
              estimatedEntropy = 0;
              for(i = 0;i < data.length;i++) {
                tmp = data[i];
                while(tmp > 0) {
                  estimatedEntropy++;
                  tmp = tmp >>> 1
                }
              }
            }
            this._pools[robin].update([id, this._eventId++, 2, estimatedEntropy, t, data.length].concat(data))
          }
          break;
        case "string":
          if(estimatedEntropy === undefined) {
            estimatedEntropy = data.length
          }
          this._pools[robin].update([id, this._eventId++, 3, estimatedEntropy, t, data.length]);
          this._pools[robin].update(data);
          break;
        default:
          err = 1
      }
      if(err) {
        throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
      }
      this._poolEntropy[robin] += estimatedEntropy;
      this._poolStrength += estimatedEntropy;
      if(oldReady === this._NOT_READY) {
        if(this.isReady() !== this._NOT_READY) {
          this._fireEvent("seeded", Math.max(this._strength, this._poolStrength))
        }
        this._fireEvent("progress", this.getProgress())
      }
    }, isReady:function(paranoia) {
      var entropyRequired = this._PARANOIA_LEVELS[paranoia !== undefined ? paranoia : this._defaultParanoia];
      if(this._strength && this._strength >= entropyRequired) {
        return this._poolEntropy[0] > this._BITS_PER_RESEED && (new Date).valueOf() > this._nextReseed ? this._REQUIRES_RESEED | this._READY : this._READY
      }else {
        return this._poolStrength >= entropyRequired ? this._REQUIRES_RESEED | this._NOT_READY : this._NOT_READY
      }
    }, getProgress:function(paranoia) {
      var entropyRequired = this._PARANOIA_LEVELS[paranoia ? paranoia : this._defaultParanoia];
      if(this._strength >= entropyRequired) {
        return 1
      }else {
        return this._poolStrength > entropyRequired ? 1 : this._poolStrength / entropyRequired
      }
    }, startCollectors:function() {
      if(this._collectorsStarted) {
        return
      }
      this._eventListener = {loadTimeCollector:this._bind(this._loadTimeCollector), mouseCollector:this._bind(this._mouseCollector), accelerometerCollector:this._bind(this._accelerometerCollector)};
      if(window.addEventListener) {
        window.addEventListener("load", this._eventListener.loadTimeCollector, false);
        window.addEventListener("mousemove", this._eventListener.mouseCollector, false);
        window.addEventListener("devicemotion", this._eventListener.accelerometerCollector, false)
      }else {
        if(document.attachEvent) {
          document.attachEvent("onload", this._eventListener.loadTimeCollector);
          document.attachEvent("onmousemove", this._eventListener.mouseCollector);
        }else {
          throw new sjcl.exception.bug("can't attach event");
        }
      }
      this._collectorsStarted = true
    }, stopCollectors:function() {
      if(!this._collectorsStarted) {
        return
      }
      if(window.removeEventListener) {
        window.removeEventListener("load", this._eventListener.loadTimeCollector, false);
        window.removeEventListener("mousemove", this._eventListener.mouseCollector, false);
        window.removeEventListener("devicemotion", this._eventListener.accelerometerCollector, false)
      }else {
        if(document.detachEvent) {
          document.detachEvent("onload", this._eventListener.loadTimeCollector);
          document.detachEvent("onmousemove", this._eventListener.mouseCollector);
        }
      }
      this._collectorsStarted = false
    }, addEventListener:function(name, callback) {
      this._callbacks[name][this._callbackI++] = callback
    }, removeEventListener:function(name, cb) {
      var i, j, cbs = this._callbacks[name], jsTemp = [];
      for(j in cbs) {
        if(cbs.hasOwnProperty(j) && cbs[j] === cb) {
          jsTemp.push(j)
        }
      }
      for(i = 0;i < jsTemp.length;i++) {
        j = jsTemp[i];
        delete cbs[j]
      }
    }, _bind:function(func) {
      var that = this;
      return function() {
        func.apply(that, arguments)
      }
    }, _gen4words:function() {
      for(var i = 0;i < 4;i++) {
        this._counter[i] = this._counter[i] + 1 | 0;
        if(this._counter[i]) {
          break
        }
      }
      return this._cipher.encrypt(this._counter)
    }, _gate:function() {
      this._key = this._gen4words().concat(this._gen4words());
      this._cipher = new sjcl.cipher.aes(this._key)
    }, _reseed:function(seedWords) {
      this._key = sjcl.hash.sha256.hash(this._key.concat(seedWords));
      this._cipher = new sjcl.cipher.aes(this._key);
      for(var i = 0;i < 4;i++) {
        this._counter[i] = this._counter[i] + 1 | 0;
        if(this._counter[i]) {
          break
        }
      }
    }, _reseedFromPools:function(full) {
      var reseedData = [], strength = 0, i;
      this._nextReseed = reseedData[0] = (new Date).valueOf() + this._MILLISECONDS_PER_RESEED;
      for(i = 0;i < 16;i++) {
        reseedData.push(Math.random() * 0x100000000 | 0)
      }
      for(i = 0;i < this._pools.length;i++) {
        reseedData = reseedData.concat(this._pools[i].finalize());
        strength += this._poolEntropy[i];
        this._poolEntropy[i] = 0;
        if(!full && this._reseedCount & 1 << i) {
          break
        }
      }
      if(this._reseedCount >= 1 << this._pools.length) {
        this._pools.push(new sjcl.hash.sha256);
        this._poolEntropy.push(0)
      }
      this._poolStrength -= strength;
      if(strength > this._strength) {
        this._strength = strength
      }
      this._reseedCount++;
      this._reseed(reseedData)
    }, _mouseCollector:function(ev) {
      var x = ev.x || ev.clientX || ev.offsetX || 0, y = ev.y || ev.clientY || ev.offsetY || 0;
      sjcl.random.addEntropy([x, y], 2, "mouse");
      this._addCurrentTimeToEntropy(0)
    }, _loadTimeCollector:function() {
      this._addCurrentTimeToEntropy(2)
    }, _addCurrentTimeToEntropy:function(estimatedEntropy) {
      if(window && window.performance && typeof window.performance.now === "function") {
        sjcl.random.addEntropy(window.performance.now(), estimatedEntropy, "loadtime")
      }else {
        sjcl.random.addEntropy((new Date).valueOf(), estimatedEntropy, "loadtime")
      }
    }, _accelerometerCollector:function(ev) {
      var ac = ev.accelerationIncludingGravity.x || ev.accelerationIncludingGravity.y || ev.accelerationIncludingGravity.z;
      if(window.orientation) {
        var or = window.orientation;
        if(typeof or === "number") {
          sjcl.random.addEntropy(or, 1, "accelerometer")
        }
      }
      if(ac) {
        sjcl.random.addEntropy(ac, 2, "accelerometer")
      }
      this._addCurrentTimeToEntropy(0)
    }, _fireEvent:function(name, arg) {
      var j, cbs = sjcl.random._callbacks[name], cbsTemp = [];
      for(j in cbs) {
        if(cbs.hasOwnProperty(j)) {
          cbsTemp.push(cbs[j])
        }
      }
      for(j = 0;j < cbsTemp.length;j++) {
        cbsTemp[j](arg)
      }
    }};
    sjcl.random = new sjcl.prng(6);
    (function() {
      try {
        var buf, crypt, getRandomValues, ab;
        if(typeof module !== "undefined" && module.exports && (crypt = require("crypto")) && crypt.randomBytes) {
          buf = crypt.randomBytes(1024 / 8);
          buf = new Uint32Array((new Uint8Array(buf)).buffer);
          sjcl.random.addEntropy(buf, 1024, "crypto.randomBytes")
        }else {
          if(window && Uint32Array) {
            ab = new Uint32Array(32);
            if(window.crypto && window.crypto.getRandomValues) {
              window.crypto.getRandomValues(ab)
            }else {
              if(window.msCrypto && window.msCrypto.getRandomValues) {
                window.msCrypto.getRandomValues(ab)
              }else {
                return
              }
            }
            sjcl.random.addEntropy(ab, 1024, "crypto.getRandomValues")
          }else {
          }
        }
      }catch(e) {
        console.log("There was an error collecting entropy from the browser:");
        console.log(e)
      }
    })();
}).call(this);

