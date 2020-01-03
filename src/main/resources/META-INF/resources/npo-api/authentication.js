
var NpoApiAuthentication = function( apiKey, apiSecret, apiVersion) {
    this.api_version = apiVersion || 'v1';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
};

NpoApiAuthentication.prototype = {
    // private methods
    _getCredentials: function (headers, resourcePath, params) {
        var location = document.location;
        origin = params['x-origin'] || (location.origin || (location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''))); //IE :(
        var data = 'origin:' + origin;
        if (! headers[ 'x-npo-date' ]) {
            headers['x-npo-date'] = new Date().toUTCString();
        }
        data += ',x-npo-date:' + headers['x-npo-date'];

        if (resourcePath) {
            data += ',uri:/' + this.api_version + '/api/';
            data += resourcePath.split('?')[0];
            data += this._getParametersForEncode(resourcePath, params);
        }

        var base64 = CryptoJS.HmacSHA256(data, this.apiSecret).toString(CryptoJS.enc.Base64);
        //var base64 =  btoa(CryptoJS.HmacSHA256(data, this.apiSecret));
        console.log("encoding with ", data, this.apiSecret, base64);
        return base64;
    },

    _getParametersForEncode: function (resourcePath, params) {
        params = params || this._getParametersFromResourcePath(resourcePath);
        var sorted = this._getSortedParameters(params);
        var result = "";
        sorted.forEach(function(s) {
            result += ',' + s.key + ':' + s.value;
        });
        return result;
    },
    _getParametersFromResourcePath: function (resourcePath) {
        var questionMark = resourcePath.indexOf('?');
        var hash = {};
        if (questionMark >= 0) {
            var params = resourcePath.substring(questionMark + 1).split('&');
            var paramLength = params.length;

            for (var i = 0; i < paramLength; i++) {
                var param = params[i].split('=');
                hash[param[0]] = param[1];
            }
        }
        return hash;
    },
    _getSortedParameters: function (params) {
        var ordered = [];
        Object.keys(params).sort().forEach(function(key) {
            ordered.push({ 'key': key, 'value': params[key]});
        });
        return ordered;
    },
    getQueryParameters: function(params) {
        var sorted = this._getSortedParameters(params);
        var result = "";
        var sep = '?';
        sorted.forEach(function(s) {
            result += sep + s.key + '=' + encodeURIComponent(s.value);
            sep = '&';
        });
        return result;

    },

    addAuthorizationHeader: function (headers, resourcePath, params) {
        headers['Authorization'] = this.getAuthorizationHeader(headers, resourcePath, params);
    },

    getAuthorizationHeader: function (headers, resourcePath, params) {
        var header =  'NPO ' + this.apiKey + ":" + this._getCredentials(headers, resourcePath, params);
        return header;
    }
};
