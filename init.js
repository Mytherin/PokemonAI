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

db_pokemon = []

function download_file(file, url, cb) {
	var http = require('https');
	var fs = require('fs');

	var file = fs.createWriteStream(file);
	var request = http.get(url, function(response) {
	    response.pipe(file);
	    file.on('finish', function() {
	      file.close(cb);
	    });
	});
}

function get_pokemon_info(pokemon) {
	const axios = require("axios");
	var vsprintf = require('sprintf-js').vsprintf;
	var url = vsprintf('http://pokeapi.co/api/v2/pokemon/%d', [pokemon]);

	var request = require('sync-request');
	var res = request('GET', url, {
	  'headers': {
	    'user-agent': 'pokemonAI'
	  }
	});

	var response = JSON.parse(res.getBody());

	var obj = new Object();
	obj.id = pokemon;
	obj.name = capitalizeFirstLetter(response.name);
	var sc_name = response.name;

	response.stats.forEach(function(x) {
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

	response.types.forEach(function(x) {
	ts.push(x.type.name);
	});

	obj.types = ts;

	var vsprintf = require('sprintf-js').vsprintf;

	img_file = vsprintf('images/%s-front.gif', [sc_name]);
	download_file(img_file, get_pokemon_image(pokemon, PokemonSide.FRONT), function() {});
	obj.img_front = img_file;
		
	img_file = vsprintf('images/%s-back.gif', [sc_name]);
	download_file(img_file, get_pokemon_image(pokemon, PokemonSide.BACK), function() {});
	obj.img_back = img_file;	

	db_pokemon.push(obj);

	console.log(vsprintf('Downloaded pokemon %d', [pokemon]));
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

// generates pokemon.json
var pk = [1,4,7,25,39,52,56,16,23,74,27,96,92,12,147];
pk.forEach(function(x){
	get_pokemon_info(x);
});

var fs = require('fs');
fs.writeFile("pokemon.json", JSON.stringify(db_pokemon), function(err) {
	if(err) {
		return console.log(err);
	}

    console.log("Generated pokemon.json");
});