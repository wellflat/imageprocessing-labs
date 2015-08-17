
var app: ng.IModule = angular.module('Demo', ['ngMaterial']);
app.config(($mdThemingProvider) => {
    $mdThemingProvider.theme('default');
});
