
var NpoApiAuthentication = function( apiKey, apiSecret, apiVersion) {
    this.api_version = apiVersion || 'v1';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
};

NpoApiAuthentication.prototype = {
    // private methods
    _getCredentials: function (headers, resourcePath) {
        var location = document.location;
        var origin = location.origin || (location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')); //IE :(
        var data = 'origin:' + origin;

        ['x-npo-date', 'x-npo-mid', 'x-npo-url'].forEach(function (header) {
            if (header in headers) {
                data += ',' + header.toLowerCase() + ':' + headers[header];
            }
        });

        if (resourcePath) {
            data += ',uri:/' + this.api_version + '/api/';
            data += resourcePath.split('?')[0];
            data += this._getParameters(resourcePath);
        }

        //        return CryptoJS.HmacSHA256(data, this.apiSecret).toString(CryptoJS.enc.Base64);
        btoa(CryptoJS.HmacSHA256(data, this.apiSecret));
    },

    _getParameters: function (resourcePath) {
        var result = '';
        var hash = {};
        var hashKeys = [];
        var questionMark = resourcePath.indexOf('?');

        if (questionMark >= 0) {

            var params = resourcePath.substring(questionMark + 1).split('&');
            var paramLength = params.length;

            for (var i = 0; i < paramLength; i++) {
                var param = params[i].split('=');
                hash[param[0]] = param[1];
                hashKeys.push(param[0]);
            }

            hashKeys = hashKeys.sort();

            var hashKeyLength = hashKeys.length;

            for (var j = 0; j < hashKeyLength; j++) {
                if (hashKeys[j] !== 'iecomp') {
                    result += ',' + hashKeys[j] + ':' + hash[hashKeys[j]];
                }
            }
        }

        return result;
    },

    addAuthorizationHeader: function (headers, resourcePath) {
        headers['Authorization'] = this.getAuthorizationHeader(headers, resourcePath);
    },

    getAuthorizationHeader: function (headers, resourcePath) {
        return 'NPO ' + this.apiKey + ": " + this._getCredentials(headers, resourcePath);
    }
};
