/**
 * See https://github.com/npo-poms/thesaurus/blob/main/README.adoc#npo-api-authentication
 * @param {String} apiKey
 * @param {String} apiSecret
 * @param {String} apiVersion defaults to v1
 * @constructor
 */

const NpoApiAuthentication = (function( apiKey, apiSecret, apiVersion) {
    const api_version = apiVersion || 'v1';
    const api_key = apiKey;
    const api_secret = apiSecret;

    // private methods
    function getCredentials(headers, resourcePath, params,  sorted) {
        const location = document.location;
        origin = params['x-origin'] || (location.origin || (location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''))); //IE :(
        let data = 'origin:' + origin;
        if (! headers[ 'x-npo-date' ]) {
            headers['x-npo-date'] = new Date().toUTCString();
        }
        data += ',x-npo-date:' + headers['x-npo-date'];

        if (resourcePath) {
            data += ',uri:/' + api_version + '/api/';
            data += resourcePath.split('?')[0];
            data += getParametersForEncode(resourcePath, params, sorted);
        }
        return  CryptoJS.HmacSHA256(data, api_secret).toString(CryptoJS.enc.Base64);
    }

    function getParametersForEncode(resourcePath, params, sorted) {
        params = params || getParametersFromResourcePath(resourcePath);
        const sortedParameters = sorted ? params : getSortedParameters(params);
        let result = "";
        sortedParameters.forEach(function(s) {
            result += ',' + s.key + ':' + s.value;
        });
        return result;
    }
    function getParametersFromResourcePath(resourcePath) {
        const questionMark = resourcePath.indexOf('?');
        const hash = {};
        if (questionMark >= 0) {
            const params = resourcePath.substring(questionMark + 1).split('&');
            const paramLength = params.length;

            for (let i = 0; i < paramLength; i++) {
                const param = params[i].split('=');
                hash[param[0]] = param[1];
            }
        }
        return hash;
    }
    function getSortedParameters (params) {
        const ordered = [];
        Object.keys(params).sort().forEach(function(key) {
            ordered.push({ 'key': key, 'value': params[key]});
        });
        return ordered;
    }


    return Object.freeze({
        /**
         * Given a map of params, sort them and convert it to a query string
         *
         * @param {Object} params A map of parameters
         * @param {boolean} sorted wether the give params are sorted already (defaults to false)
         */
        getQueryParameters: function (params, sorted) {
            const sortedParameters = getSortedParameters(params, sorted);
            let result = "";
            let sep = '?';
            sortedParameters.forEach(function (s) {
                result += sep + s.key + '=' + encodeURIComponent(s.value);
                sep = '&';
            });
            return result;

        },

        /**
         * Calculates and adds the authorization header to the given map of headers
         * @param {Object} headers the current headers. May include 'x-origin'
         * @param {String} resourcePath The resource path on the api which will be queried (without /v1/api)
         * @param {Object} params (optional) the query parameters that to be added. If not given, they will be parsed from the resourcePath
         * @param {boolean} sorted wether the give params are sorted already (defaults to false)
         */
        addAuthorizationHeader: function (headers, resourcePath, params, sorted) {
            headers['Authorization'] = this.getAuthorizationHeader(headers, resourcePath, params);
        },

        /**
         * Calculates the authorization header to given map of headers
         * @param {Object} headers the current headers. May include 'x-origin'
         * @param {String} resourcePath The resource path on the api which will be queried (without /v1/api)
         * @param {Object} params (optional) the query parameters that to be added. If not given, they will be parsed from the resourcePath
         * @param {boolean} sorted wether the give params are sorted already (defaults to false)
         */
        getAuthorizationHeader: function (headers, resourcePath, params, sorted) {
            return 'NPO ' + api_key + ":" + getCredentials(headers, resourcePath, params, sorted);
        }
    });
})();

try {
    exports.NpoApiAuthentication = NpoApiAuthentication;
} catch (e) { /* ignored for unsupported browsers */}

