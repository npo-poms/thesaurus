var gtaaApp = angular.module('gtaaApp', [
    //'ngAnimate',
    'ngSanitize',
    'ui.bootstrap'
]);



gtaaApp.config(function($locationProvider, $httpProvider) {
    $locationProvider.html5Mode({
        enabled : true,
        requireBase : false
    });
    $httpProvider.defaults.withCredentials = true;
});

if (typeof console == "undefined") {
    console = { log: function (msg) { } };
}

gtaaApp.directive('typeaheadFocus', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            ngModel.$setViewValue( scope.concept.$searchValue );
        }
    };
});

gtaaApp.directive('gtaaCreditableForm', function () {
    return {
        templateUrl : serverInfo.ctx + '/thesaurus/popup/templates/form/display/creditable.html'
    };
});

gtaaApp.directive('gtaaGeographicnameForm', function () {
    return {
        templateUrl : serverInfo.ctx + '/thesaurus/popup/templates/form/display/geographicname.html'
    };
});


gtaaApp.directive('gtaaConceptForm', function () {
    return {
        templateUrl : serverInfo.ctx + '/thesaurus/popup/templates/form/display/concept.html'
    };
});



gtaaApp.directive('gtaaDisplayFooter', function () {
    return {
        templateUrl : serverInfo.ctx + '/thesaurus/popup/templates/form/display/footer.html'
    };
});


gtaaApp.directive('gtaaRegisterForm', function () {
    return {
        templateUrl : serverInfo.ctx + '/thesaurus/popup/templates/form/register/concept.html'
    };
});

gtaaApp.directive('gtaaRegisterFooter', function () {
    return {
        templateUrl : serverInfo.ctx + '/thesaurus/popup/templates/form/register/footer.html'
    };
});


