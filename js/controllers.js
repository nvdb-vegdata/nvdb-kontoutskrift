app.controller("kontoutskriftCtrl", ['$scope', 'nvdb', function ($scope, nvdb) {

    // Standard datasettvalg
    $scope.datavalg = '1';

    // Standard kolonneinndeling
    $scope.inndeling = 'region';
    
    // Standard kategorivalg
    $scope.vegkategori = 'er';
    
    // Beregner prosent per celle
    $scope.prosent = function (total, antall) {
        if (total == 0) {
            return '0';
        } else {
            var andel = (total - antall) / total;
            var prosent = (andel * 100).toFixed(1);
            
            var color = '';
            
            if (prosent == 100) {
                color = 'v100';
            } else if (prosent > 90) {
                color = 'v80-100';
            } else if (prosent > 80) {
                color = 'v60-80';
            } else if (prosent > 60) {
                color = 'v40-60';
            } else if (prosent > 40) {
                color = 'v20-40';
            } else {
                color = 'v0-20';
            }

            return '<span class="'+color+'">'+prosent+' %</span>';
        }
    };
    
    $scope.byttDato = function () {
    
        if ($scope.resultatsett[$scope.dato] === undefined) {
            if ($scope.dato == 'idag') {
                $scope.resultatsett[$scope.dato] = {};
                $scope.resultat = $scope.resultatsett[$scope.dato];
            } else {
                nvdb.dato($scope.dato).then(function(promise) {
                    $scope.resultatsett[$scope.dato] = promise.data;
                    $scope.resultat = $scope.resultatsett[$scope.dato];
                });
            }
            
        } else {
            $scope.resultat = $scope.resultatsett[$scope.dato];
        }
    };
    
    $scope.velgRegion = function (nr) {
        var fylker = [];
        for (var i = 0; i < $scope.omrade.fylke.length; i++) {
            if ($scope.regionfylker[nr].indexOf($scope.omrade.fylke[i].nr) > -1) {
                fylker.push($scope.omrade.fylke[i]);
            }
        }
        $scope.omrade.fylke = fylker;
        $scope.inndeling = 'fylke';
    };
    
    $scope.byttOmrade = function () {
        if ($scope.inndeling == 'region') {
            $scope.omrade.fylke = angular.copy($scope.fylker);
        }
    };
    
    $scope.hentObjekttype = function (id) {
        var obj = $scope.datasett[$scope.datavalg].filter(function(val) {
            return val.id === id;
        });
        return obj[0];
    };
        
    // Funksjon for å hente antall objekter fra APIet
    $scope.hentResultat = function (sum) {

        // Går gjennom alle objekttyper
        for (var i = 0; i < $scope.datasett[$scope.datavalg].length; i++) {
        
            // Oppretter søkeobjekt for objekttypen
            var objekttype = $scope.datasett[$scope.datavalg][i];
            
            
            if ($scope.resultatsett['idag'][objekttype.id] === undefined) {
                $scope.resultatsett['idag'][objekttype.id] = {};
            }
           
            var sok = {
                'objektTyper': [{
                    'id': objekttype.id,
                    'antall': 0
                }],
                'lokasjon': {
                    'vegreferanse': $scope.vegkategorier[$scope.vegkategori]
                }
            }
            
            // Går gjennom hvert område i inndelingen
            for (var k = 0; k < $scope.omrade[$scope.inndeling].length; k++) {
            
            
                // Oppretter søkeobjekt for området
                var omrade = $scope.omrade[$scope.inndeling][k];
                var sok2 = angular.copy(sok); 
                sok2['lokasjon'][$scope.inndeling] = [omrade.nr];

                // Henter antall objekter innenfor området
                nvdb.sok(sok2).then(function(promise) {
                    var resultat = promise.data;
                    var antall = resultat.resultater[0].statistikk.antallFunnet;
                    var objekttype = resultat.sokeObjekt.objektTyper[0].id;
                    var omradenr = resultat.sokeObjekt.lokasjon[$scope.inndeling][0];
                    
                    // Legger til resultat
                    if ($scope.resultatsett['idag'][objekttype][$scope.inndeling+omradenr] === undefined) {
                        $scope.resultatsett['idag'][objekttype][$scope.inndeling+omradenr] = {};
                    }
                    $scope.resultatsett['idag'][objekttype][$scope.inndeling+omradenr][$scope.vegkategori] = {};
                    $scope.resultatsett['idag'][objekttype][$scope.inndeling+omradenr][$scope.vegkategori].antall = antall;

                    var egenskapstyper = $scope.hentObjekttype(objekttype).egenskapstyper;
                    
                    // Går gjennom hver egenskapstype for objekttpyne
                    for (var l = 0; l < egenskapstyper.length; l++) {
                        
                        // Oppretter søkeobjekt for hver egenskapstype
                        var egenskapstype = egenskapstyper[l]

                        var sok3 = angular.copy(resultat.sokeObjekt);
                        
                        sok3.objektTyper[0].filter = [];
                        
                        sok3.objektTyper[0].filter.push({
                            'type': egenskapstype.navn,
                            'operator': '=',
                            'verdi': [null]
                        })

                        // Henter antall objekter
                        nvdb.sok(sok3).then(function(promise) {
                            var resultat = promise.data;
                            var antall = resultat.resultater[0].statistikk.antallFunnet;
                            var objekttype = resultat.sokeObjekt.objektTyper[0].id;
                            var omradenr = resultat.sokeObjekt.lokasjon[$scope.inndeling][0];
                            var egenskapstype = resultat.sokeObjekt.objektTyper[0].filter[0].type;
                            
                            // Legger til resultat
                            $scope.resultatsett['idag'][objekttype][$scope.inndeling+omradenr][$scope.vegkategori][egenskapstype] = {};
                            $scope.resultatsett['idag'][objekttype][$scope.inndeling+omradenr][$scope.vegkategori][egenskapstype].antall = antall;
                            var total = $scope.resultatsett['idag'][objekttype][$scope.inndeling+omradenr][$scope.vegkategori].antall;
                            var prosent = $scope.prosent(total, antall);
                            $scope.resultatsett['idag'][objekttype][$scope.inndeling+omradenr][$scope.vegkategori][egenskapstype].prosent = prosent;
                            resultat.sokeObjekt.objektTyper[0].antall = 15000;
                            var kriterie = angular.toJson(resultat.sokeObjekt).replace(/\//g, '%2F');
                            $scope.resultatsett['idag'][objekttype][$scope.inndeling+omradenr][$scope.vegkategori][egenskapstype].url = kriterie;

                        });
                        
                    }
                    

                });
                

                
            }
            
        }
        
    };
    
    $scope.lagreResultat = function () {
        console.log('Lagrer resultat til fil...');
        var text = angular.toJson($scope.resultat);
        var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
        var today = new Date();
        saveAs(blob, today.getFullYear()+"-"+today.getMonth()+"-"+today.getDate()+".json");
    }
     
}]);
