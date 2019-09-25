gtaaApp.controller('GtaaConceptController', function($scope, $http, $location, $window, $timeout, GtaaService) {

    $scope.registerNewConcept = false;

    $scope.geoRoles    = $window.serverInfo.geoRoles;
    $scope.personRoles = $window.serverInfo.personRoles;
    $scope.gtaaSchemes = $window.serverInfo.gtaaSchemes;

    if ($location.search().schemes) {
        $scope.schemes = $location.search().schemes.split(',').map(function (s) {
            return $scope.gtaaSchemes[s];
        });
    } else {
        $scope.schemes = [];
        Object.values($scope.gtaaSchemes).forEach(function(gtaaScheme) {
            $scope.schemes.push(gtaaScheme);
        });
    }

    $scope.concept = {
        $searchValue: $location.search().name
    };
    if (! $scope.concept.$searchValue) {
        $scope.concept.$searchValue = '';
        if ($location.search().familyName) {
            $scope.concept.$searchValue = $location.search().familyName;
        }
        if ($location.search().givenName) {
            if ($scope.concept.$searchValue.length > 0) {
                $scope.concept.$searchValue += ', ';
            }
            $scope.concept.$searchValue += $location.search().givenName;
        }
    }


    $scope.emptyRequiredFields = {};

    $scope.waiting = false;
    $scope.suggestionsWaiting = $scope.concept.$searchValue.length > 0 || $location.search().id;

    /**
     * Utility to delete all keys starting with dollar (recursively)
     */
    deletePrivates = function(object) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                if (key.startsWith("$")) {
                    delete object[key];
                    continue;
                }
                if (object[key] instanceof  Object) {
                    this.deletePrivates(object[key]);
                }
            }
        }

    };

    /**
     * The 'concept' object used in javascript is quite messy, and is polluted with all kind of fields
     * This fixes that, and makes a clean json object which separates the several concepts needed.
     */

    conceptToMessage = function(webformAction) {
        $scope.resolveScheme($scope.concept);
        // make a copy because angular (and we too) pollutes the object
        var message = {
            action: webformAction,
            concept: angular.copy($scope.concept),
            role:  angular.copy($scope.concept.$role)
        };

        deletePrivates(message);
        return message;
    };



    function processPost(message, url) {
        var config = {
            "headers": {
                'Content-Type': 'application/json'
            }
        };
        $http.post(url, message, config).then(
            function (response) {
                log("processPost", response);
                sendToOpener(response.data, response.status, false);
            },
            function (response) {
                alert(response);

            });
    }

    /**
     * Called when user ends the pop up session.
     *
     * @param webformAction either 'selected' or 'canceled'
     */
    function sendBack(webformAction) {
        var message = conceptToMessage(webformAction);
        log("sending back ", message);

        var callbackService = $location.search().callbackService;
        if(callbackService) {
            log('sending to back to specified endpoint', message, callbackService);
            processPost(message, callbackService);
        } else {
            sendToOpener(message, true)
        }
    }
    function sendToOpener(message, alertIfNoOpener) {
        var opener = $window.opener || $window.parent;
        if (opener) {
            log('sending message  back to main window', message);
            if (!document.all) {
                opener.postMessage(message, '*');
            } else {
                if (opener.postIEMessage) {
                    opener.postIEMessage(message, '*', message.action);
                }
            }
        } else {
            if (alertIfNoOpener) {
                alert(JSON.stringify(message));
            }
        }
    }

    /**
     *
     */
    function addFields(concept) {
        if (concept.objectType) {
            switch (concept.objectType) {
                case "person":
                    concept.$role = {
                        "name": "UNDEFINED"
                    };
                    break;
                case "geographicname":
                    concept.$role = {
                        "name":"UNDEFINED"
                    };
                    break;
            }

            try {
                concept.$highlight = concept.id === $location.search().id;
                concept.$scheme = $scope.gtaaSchemes[concept.objectType];
                concept.$schemeLabel = $scope.gtaaSchemes[concept.objectType].label;
                if (concept.$role) {
                    if ($location.search().role) {
                        concept.$role.name = $location.search().role;
                    }
                }
            } catch (e) {
                log(e, concept);
            }
        }
        return concept;
    }



    $scope.suggest = function( data, maxResults ) {
        $scope.lastQuery = data;
        $scope.suggestionsWaiting = true;
        return GtaaService.suggestions( data, maxResults, $scope.schemes ).then(
            function ( result ) {
                var r =  result.map( addFields );
                r.sort(function(a, b){
                    // mainly: leave the 'new concept' hack where it is.
                    {
                        if (a.id == null && b.id != null) {
                            return 1;
                        }
                        if (a.id != null && b.id == null) {
                            return -1;
                        }
                    }
                    return a.id === $location.search().id ? -1 : (b.id === $location.search().id ? 1 : 0)});
                $scope.suggestionsWaiting = false;
                return r;
            }.bind(this),
            function ( error ) {
                $scope.error= error.data;
                $scope.suggestionsWaiting = false;
            }.bind( this )
        );
    };

    $scope.register = function() {
        var message = conceptToMessage();
        var concept = message.concept;
        log("registering ", message);

        $scope.error = null;
        $scope.waiting = true;
        GtaaService.submitConcept(concept, $location.search().jwt ).then(
            function ( result ) {
                $scope.concept = result.data;
                $scope.concept.role = message.role;
                $scope.registerNewConcept = false;
                addFields($scope.concept);
                $scope.waiting = false;
                log("Submitted", concept, "became", $scope.concept);
                $scope.focusSubmit();
            },
            function ( error ) {
                $scope.waiting = false;
                log(error);
                error.config = error.config || {};
                error.data = error.data || {};
                if ( ! error.message) {
                    // can this not happen?
                    error.message = error.data.message;
                }
                if (! error.message) {
                    error.message = "Error while submitting " + JSON.stringify(concept) + " to " + error.config.url;
                }
                $scope.error = error;
            }
        );
    };


     $scope.submit = function() {
         sendBack('selected');
    };

    $scope.create = function() {
        log('showing create form ' +  $scope.lastQuery);
        $scope.registerNewConcept = true;
    };

    $scope.cancel = function() {
        $scope.registerNewConcept = false;
        $scope.concept = {};
        $scope.noResults = false;
        sendBack('canceled');
    };

    $scope.cancelRegistration = function() {
        $scope.registerNewConcept = false;
    };

    $scope.get = function(id) {
        return $http.get('/v1/api/thesaurus/concepts/status', {
            params: {
                id: id
            }
        }).then(function (response) {
            var data = response.data;
            //some messages are not concept objects.
            if (this.validConcept(data)) {
                $scope.setSearchValue(data.name);
            }
        }.bind(this));
    };

    $scope.setSearchValue = function(searchValue) {
        $scope.concept.$searchValue = searchValue;
        $scope.suggestionsWaiting = true;
        // this seems to be the way to trigger a typehead.
        angular.element(document.getElementById("searchValue")).controller("ngModel").$setViewValue($scope.concept.$searchValue);
    };

    $scope.onSelect = function(item, model) {
        $scope.concept = {};
        $scope.concept = Object.assign($scope.concept, model);
        if(model.$create) {
            $scope.create();
        } else {
            $scope.focusSubmit();
        }
    };
    $scope.focusSubmit = function() {
        $timeout(function () {
            document.querySelector('#submit').focus();
        }, 100);
    };

    $scope.isPerson = function(concept) {
        return (concept instanceof Object) && concept.objectType === "person";
    };

    $scope.isGeographicName= function(concept) {
        return (concept instanceof Object) && concept.objectType === "geographicname";
    };
    $scope.isConcept = function(concept) {
        return ! concept.$create;
    };

    $scope.validPerson = function(concept) {
        var result = true;
        result &= $scope.validateRequiredField(concept.givenName, "givenName", "voornaam");
        result &= $scope.validateRequiredField(concept.familyName, "familyName", "achternaam");
        return result;
    };


    $scope.validConcept = function(concept) {
        $scope.resolveScheme(concept);
        if (! $scope.registerNewConcept) {
            return true;
        }
        var result = true;
        if ($scope.isPerson(concept)) {
            result &= $scope.validPerson(concept);
        } else {
            result &= $scope.validateRequiredField(concept.name, "name", "naam");
        }
        if (concept.objectType === 'geographicname' || concept.objectType === 'person') {
            //result &= $scope.validateRequiredField(concept, "role", "rol");
        }
        result &= $scope.validateRequiredField(concept.scopeNotes[0], "scopeNotes", "opmerking");
        return result;
    };

    /**
     * Look out, this function has side effect!
     */
    $scope.validateRequiredField = function(conceptValue, key, label) {
        var result = conceptValue !== undefined && conceptValue !== '';
        if (! result) {
            $scope.emptyRequiredFields[key] = label;
        } else {
            delete $scope.emptyRequiredFields[key];
        }
        return result;
    };

    $scope.resolveScheme = function(concept) {
        if (concept.$scheme) {
            // this is a hack
            concept.objectType = concept.$scheme.objectType;
        }
    };

    if ($location.search().id && $scope.concept.$searchValue.length === 0) {
        $scope.get($location.search().id);
    }

});
