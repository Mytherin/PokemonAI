var connect = require('connect');
var serveStatic = require('serve-static');

var Pokemon = {
  BULBASAUR: 1,
  CHARMANDER: 4,
  SQUIRTLE : 7,
  PIKACHU : 25,
  JIGGLYPUFF : 39,
  MEOWTH : 52,
  MANKEY : 56,
  PIDGEY : 16,
  EKANS : 23,
  GEODUDE : 74,
  SANDSHREW : 27,
  DROWZEE : 96,
  GASTLY : 92,
  BUTTERFREE : 12,
  DRATINI : 147,
};

// from https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function get_pokemon_info(pokemon) {
	const axios = require("axios");
	var vsprintf = require('sprintf-js').vsprintf;
	var url = vsprintf('http://pokeapi.co/api/v2/pokemon/%d', [pokemon]);

	axios
		.get(url)
		.then(response => {
			var obj = new Object();
			obj.id = pokemon;
   			obj.name = capitalizeFirstLetter(response.data.name);



   			response.data.stats.forEach(function(x) {
 				if (x.stat.name == "speed") {
 					obj.speed = x.base_stat;
 				} else if (x.stat.name == "special-defense") {
 					obj.special_defense = x.base_stat;
 				} else if (x.stat.name == "special-attack") {
 					obj.special_attack = x.base_stat;
 				} else if (x.stat.name == "defense") {
 					obj.defense = x.base_stat;
 				} else if (x.stat.name == "attack") {
 					obj.attack = x.base_stat;
 				} else if (x.stat.name == "hp") {
 					obj.hp = x.base_stat;
 				} else {
 					console.log("get_pokemon_info: Invalid base stat");
 				}
			});

			var ts = []

			response.data.types.forEach(function(x) {
				ts.push(x.type.name);
			});

			obj.types = ts;

			obj.img_front = get_pokemon_image(pokemon, PokemonSide.FRONT);
			obj.img_back = get_pokemon_image(pokemon, PokemonSide.BACK);

   			var jsonString= JSON.stringify(obj) + ',';
   			console.log(jsonString);
		})
		.catch(error => {
			console.log(error);
		});
}

// from https://stackoverflow.com/questions/1267283/how-can-i-pad-a-value-with-leading-zeros
function zeroFill(number, width) {
	width -= number.toString().length;
	if (width > 0) {
		return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
	}
	return number + ""; // always return a string
}

var PokemonSide = {
  FRONT : 1,
  BACK : 2
};

function get_pokemon_image(pokemon, side) {
	// npm install sprintf-js
	// for proper formatting
	var vsprintf = require('sprintf-js').vsprintf;

	var side_str = vsprintf('blackwhite_animated_%s', [side == PokemonSide.FRONT ? 'front' : 'back']);
	return vsprintf('https://pldh.net/media/pokemon/gen5/%s/%s.gif',
		[side_str, zeroFill(pokemon, 3)]);
}


connect().use(serveStatic(__dirname)).listen(8080, function(){
	var fs = require('fs');
	pokemon = JSON.parse(fs.readFileSync( __dirname + '/pokemon.json'));

// generates pokemon.json
//	var pk = [1,4,7,25,39,52,56,16,23,74,27,96,92,12,147];
//	pk.forEach(function(x){
//		get_pokemon_info(x);
//	});

    console.log('Server running on 8080...');
});
