var fs = require('fs');
var obj;
var _ =  require("underscore");

//ler o arquivo

var emendas = {};
var obj = JSON.parse(fs.readFileSync('dados/chamber_of_deputies_2015.json', 'utf8'));
_.map(obj, function(emenda){
	var idPolitico = emenda._id.split(" ")[0]
	if(!_.has(emendas,idPolitico)){
		emendas[idPolitico] = []
	}
	emendas[idPolitico].push({[emenda._id]:{
		autor : emenda.author,
		valor : emenda.value
	}
	})		
	
});

//somar as emendas
var total = {}
_.map(emendas, function(politico,key){
	var p = _.first(politico)
	
	total[key] = {autor: _.values(p)[0].autor, soma: 0};
	_.map(politico, function(em){
		total[key].soma = total[key].soma + _.values(em)[0].valor
	})
});

console.log(total)