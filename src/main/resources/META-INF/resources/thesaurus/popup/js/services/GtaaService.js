gtaaApp.service('GtaaService', function($q, $http,  $location) {

    document.querySelector('#searchValue').focus();
    this.submitConcept = function(concept, secret) {
        var deferred = $q.defer();

        var isPerson = concept.objectType === 'person';

        var newConcept = {
            //newObjectType: isPerson ? "person" : "concept", // is arranged by JsonIdAdderBodyReader
            objectType: concept.objectType,
            scopeNotes: concept.scopeNotes
        };
        var neededService;
        if (isPerson) {
            newConcept.givenName = concept.givenName;
            newConcept.familyName = concept.familyName;
            neededService = 'personUpdateService';
        } else {
            newConcept.name = concept.name;
            neededService = 'conceptUpdateService';
        }

        var req = {
            method: 'POST',
            url: document.querySelector("meta[name=" + neededService + "]").getAttribute("content"),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + secret
            },
            data: newConcept
        };
        $http(req).then(
            function success(newConcept) {
                deferred.resolve(newConcept);
            }, function error(error) {
                deferred.reject(error);
            });

        return deferred.promise;

    };

    var timeout = null;
    this.suggestions = function( text, maxResults, schemes) {

        var deferred = $q.defer();

        clearTimeout(timeout);

        // make sure these parameter are sorted alphabetically:
        var params =  {
            max: maxResults,
            schemes: schemes.map(function(a) {
                return a.name;
            }),

            text: text
        };
        var suggestionHeaders = {
            "x-origin": document.location.origin
        };
        var path = "thesaurus/concepts/";
        if (typeof (npoAuthentication) !== 'undefined') {
            npoAuthentication.addAuthorizationHeader(suggestionHeaders, path, params, true);
        }
        let jsonForNew = {
            status: 'create',
            scopeNotes: [''],
            $create: true,
            //$createMessage: "Als nieuw concept registreren (" + this.concept.objectType + ")"
            $createMessage: "Als nieuw concept registreren"
        }

        if (text && params.schemes.length === 1 && params.schemes[0] === "person") {
            let familyName = null;
            let givenName = null;
            let split = text.split(/,(.+)/); // split on first comma
            familyName = split[0];
            if (split.length > 1) {
                givenName = split[1];
            } else {
                // try to split on space too
                split = text.split(/\s+(._)/);
                if (split.length > 1) {
                    givenName = split[0];
                    familyName = split[1];
                }
            }
            jsonForNew.familyName = familyName;
            jsonForNew.givenName = givenName
        } else {
            jsonForNew.name = text;
        }

        timeout = setTimeout(function() {
            $http.get('/v1/api/' + path, {
                params: params,
                headers: suggestionHeaders
            }).then(function (response) {
                    let items = response.data.items;
                    if ($location.search().jwt) {
                        items.push(jsonForNew);
                    }
                    deferred.resolve(items);
                },
                function (error) {
                    deferred.reject(error);
                });
        }.bind(this), 300);

        return deferred.promise;
    };

    this.getStatus = function(id) {
        return $http.get('/v1/api/thesaurus/concepts/status', {
            params: {
                id: id
            }
        }).then(function (response) {
            var data = response.data;
            //console.log("get", data)
            //some messages are not concept objects.
            if (validPerson(data)) {
                $scope.concept.$searchValue = data.name;
            }
        });
    };

});
