app.factory('nvdb', ['$http', function($http) {
    // var api = 'https://www.vegvesen.no/nvdb/api';
    var api = 'api.php?path=';
    
    return {
        objekttyper: function() {
            return $http.get(api+'/datakatalog/objekttyper');
        },
        objekttype: function(id) {
            return $http.get(api+'/datakatalog/objekttyper/'+id);
        },
        egenskapstype: function(id) {
            return $http.get(api+'/datakatalog/egenskapstype/'+id);
        },
        regioner: function() {
            return $http.get(api+'/omrader/regioner');
        },
        fylker: function() {
            return $http.get(api+'/omrader/fylker');
        },
        sok: function(sokeobjekt) {
            return $http.get(api+'/sok?kriterie='+angular.toJson(sokeobjekt));
        },
        datasett: function(nr) {
            return $http.get('datasett'+nr+'.json');
        },
        historikk: function() {
            return $http.get('historikk/historikk.json');
        },
        dato: function(id) {
            return $http.get('historikk/'+id+'.json');
        }
    };
    
}]);
