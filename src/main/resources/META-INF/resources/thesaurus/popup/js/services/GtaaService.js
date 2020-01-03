gtaaApp.service('GtaaService', function($q, $http,  $location) {

    document.querySelector('#searchValue').focus();
    this.submitConcept = function(concept, secret) {
        var deferred = $q.defer();

        var isPerson = concept.objectType === 'person';
        var isCreditable = isPerson || concept.objectType === 'name';

        var newConcept = {
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

        headers = {};
        if (typeof(npoAuthentication) !== 'undefined') {
            npoAuthentication.addAuthorizationHeader(headers, "/v1/api/thesaurus/concepts/");
        }

        timeout = setTimeout(function() {
            $http.get('/v1/api/thesaurus/concepts/', {
                params: {
                    text: text,
                    schemes: schemes.map(function(a) {
                        return a.name;
                    }),
                    max: maxResults
                },
                headers: headers
            }).then(function (response) {
                    var items = response.data.items;

                    if ($location.search().jwt) {
                        // This is a stupid hack!!
                        items.push({
                            name: text,
                            status: 'create',
                            scopeNotes: [''],
                            $create: true,
                            $createMessage: "Als nieuw concept registreren"
                        });
                    }
                    deferred.resolve(items);
                },
                function (error) {
                    deferred.reject(error);
                });
        }, 300);

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
