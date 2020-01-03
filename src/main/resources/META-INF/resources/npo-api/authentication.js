/**
 * See https://github.com/npo-poms/thesaurus/blob/master/README.adoc#npo-api-authentication
 * @param {String} apiKey
 * @param {String} apiSecret
 * @param {String} apiVersion defaults to v1
 * @constructor
 */

var NpoApiAuthentication = function( apiKey, apiSecret, apiVersion) {
    this.api_version = apiVersion || 'v1';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
};

NpoApiAuthentication.prototype = {
    // private methods
    _getCredentials: function (headers, resourcePath, params,  sorted) {
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
            data += this._getParametersForEncode(resourcePath, params, sorted);
        }

        var base64 = CryptoJS.HmacSHA256(data, this.apiSecret).toString(CryptoJS.enc.Base64);
        //var base64 =  btoa(CryptoJS.HmacSHA256(data, this.apiSecret));
        //console.log("encoding with ", data, this.apiSecret, base64);
        return base64;
    },

    _getParametersForEncode: function (resourcePath, params, sorted) {
        params = params || this._getParametersFromResourcePath(resourcePath);
        var sortedParameters = sorted ? params : this._getSortedParameters(params);
        var result = "";
        sortedParameters.forEach(function(s) {
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

    /**
     * Given a map of params, sort them and convert it to a query string
     *
     * @param {Object} params A map of parameters
     * @param {boolean} sorted wether the give params are sorted already (defaults to false)
     */
    getQueryParameters: function(params, sorted) {
        var sortedParameters = this._getSortedParameters(params, sorted);
        var result = "";
        var sep = '?';
        sortedParameters.forEach(function(s) {
            result += sep + s.key + '=' + encodeURIComponent(s.value);
            sep = '&';
        });
        return result;

    },

    /**
     * Calculates and adss the authorization header to to given map of headers
     * @param {Object} headers the current headers. May include 'x-origin'
     * @param {String} resourcePath The resource path on the api which will be queried (without /v1/api)
     * @param {Object} params (optional) the query parameters that to be added. If not given, they will be parsed from the resourcePath
     * @param {boolean} sorted wether the give params are sorted already (defaults to false)
     */
    addAuthorizationHeader: function (headers, resourcePath, params, sorted) {
        headers['Authorization'] = this.getAuthorizationHeader(headers, resourcePath, params);
    },

    /**
     * Calculates the authorization header to to given map of headers
     * @param {Object} headers the current headers. May include 'x-origin'
     * @param {String} resourcePath The resource path on the api which will be queried (without /v1/api)
     * @param {Object} params (optional) the query parameters that to be added. If not given, they will be parsed from the resourcePath
     * @param {boolean} sorted wether the give params are sorted already (defaults to false)
     */
    getAuthorizationHeader: function (headers, resourcePath, params, sorted) {
        var header =  'NPO ' + this.apiKey + ":" + this._getCredentials(headers, resourcePath, params, sorted);
        return header;
    }
};
