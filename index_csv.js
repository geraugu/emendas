var parse = require('csv-parse');
var fs = require('fs');
var transform = require('stream-transform');
var _ =  require("underscore");
var firebase =  require("firebase");
var Globals = require("./Globals")
var request = require('request');

var app = null;
var database = null;

app = firebase.initializeApp(Globals.FIREBASE_CONFIG);
database = app.database();

//busca os politicos
buscaPoliticos(function (politicos){
	//le as emendas
	readEmendas(politicos,null)
})

function readEmendas(politicos,callback){
	var obj = fs.createReadStream('dados/2015_a_2017.csv', 'utf8');
	var parser = parse({delimiter: ';'})
	var emendas = {}
	parser.on('readable', function(){
	  while(record = parser.read()){
		var idPolitico = record[1].substring(0, 4)
		if(idPolitico !== 'Emen'){
			if(!_.has(emendas,idPolitico)){
				emendas[idPolitico] = []
			}	  
			emendas[idPolitico].push(
				{
					[record[1]]:{
						autor : record[0],
						valor : parseFloat(record[6])
					}
				}
			)
		}
		
	  }
	});

	parser.on('finish', function(){
		var total = {}
		
		_.map(emendas, function(politico,key){
			var p = _.first(politico)
			var nome = _.values(p)[0].autor
			//procurar o politico
			var search = _.findWhere(politicos, {nome: nome}) 
			var idCadastro = 0;
			if(!search){
				//console.log(nome)
			}else{
				idCadastro = search.idCadastro;
				var tipo = search.tipo;
				total[idCadastro] = {autor: nome, soma: 0, key, tipo};
				_.map(politico, function(em){
					total[idCadastro].soma = total[idCadastro].soma + _.values(em)[0].valor
				})
			}
			
			
		});
		console.log(total)
		var updates = {};
			  
			  
			  updates["/emendas-total/"] = total;
			  database.ref().update(updates);
		})
		obj.pipe(parser)

}





function buscaPoliticos(callback){
	//buscar os politicos
	request('https://monitorabrasil.com/monitorarest/getPoliticos/s?limit=600&pg=0', function (error, response, body) {
		var body = JSON.parse(body);
		var politicos = body[0].politicos;
		request('https://monitorabrasil.com/monitorarest/getPoliticos/c?limit=600&pg=0', function (error, response, body) {
			var body = JSON.parse(body);
			politicos = politicos.concat(body[0].politicos);
			callback(politicos)
		});	
	});	
} 





