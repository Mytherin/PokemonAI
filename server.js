var express = require('express');
var app = express();

app.set('port', (8080));
app.use(express.static(__dirname + '/'));

app.listen(app.get('port'), function(){
		var fs = require('fs');
		db_pokemon = JSON.parse(fs.readFileSync( __dirname + '/pokemon.json'));

	    console.log('Server running on http://localhost:8080...');
	});
app.post('/update_matrix', update_matrix);
app.post('/set_team', set_team);

app.post('/get_teams', get_teams);



var Condition = {
  NONE : 0,
  PARALZYED : 1,
};


// from https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function lookup_pokemon(name) {
	var key = capitalizeFirstLetter(name);

	for (var i = 0; i < db_pokemon.length; i++) {
		if (key == db_pokemon[i].name) {
			return db_pokemon[i];
		}
	}

	return null;
}

function figure_out_type(poke_entry) {
	var types = poke_entry.types;
	types.sort();
	return types.join("");
}

function get_train_data(team, pokemon) {
	var vsprintf = require('sprintf-js').vsprintf;
	var sanitize = require("sanitize-filename");
	return vsprintf('training/train_%s_%d.json', [sanitize(pokemon), team]);
}

function update_matrix(req, res, next) {
	console.log('Time for some action:');

	var qtext = decodeURIComponent(req.query.json);
	var update = JSON.parse(qtext);

	console.log('Update with: %s', qtext);

	// test values
	var team = update.team;
	var pokemon = update.pokemon;
	var attack = update.attack;
	var opp_state = update.opp_status;
	var attack_damage = update.damage;
	var attack_cond = Condition.None;
	var opp_pokemon = update.opp_pokemon;

	// figure out pokemon type
	var poke_entry = lookup_pokemon(pokemon);
	if (!poke_entry) {
		console.log("Pokemon '%s' not found", pokemon);
		return;
	}

	var poke_entry = lookup_pokemon(opp_pokemon);
	if (!poke_entry) {
		console.log("Pokemon '%s' not found", opp_pokemon);
		return;
	}

	var poke_type = figure_out_type(poke_entry);


	var fs = require('fs');
	var vsprintf = require('sprintf-js').vsprintf;

	var matrix = {}

	if (team >= 0) {
		// update our matrix
		var filename = get_train_data(team, pokemon);

		if (fs.existsSync(filename)) {
			matrix = JSON.parse(fs.readFileSync(filename));
		}

		if (attack) { // hack for initial loading
			var mkey = poke_type + '/' + attack + '/' + opp_state;
			console.log(mkey);

			var mval = matrix[mkey];
			var newval = new Object();
			newval.damage = attack_damage;
			newval.cond = attack_cond;

			var write_back = true;
			if (!mval) {
				mval = newval;
			} else {
				if (mval.damage > attack_damage) {
					mval = newval;
				} else {
					write_back = false;
				}
			}

			matrix[mkey] = mval;

			if (write_back) {
				// hopefully saves me SSD cycles :)
				console.log("write matrix to %s", filename);
				fs.writeFileSync(filename, JSON.stringify(matrix));
			}
		}
	}

	res.setHeader('Content-Type', 'application/json');
	console.log(JSON.stringify(matrix));
    res.send(JSON.stringify(matrix));
}

function set_team(req, res, next) {
	var qtext = decodeURIComponent(req.query.json);
	var update = JSON.parse(qtext);

	console.log('Set team with: %s', qtext);

	// test values
	var team = update.team;
	var pokemon = update.pokemon;
	var teamname = update.descr;

	var fs = require('fs');
	var vsprintf = require('sprintf-js').vsprintf;

	var filename = vsprintf('training/team_%s.json', [team]);

	res.setHeader('Content-Type', 'application/json');

	// update with pokemon
	fs.writeFileSync(filename, JSON.stringify(update));	

	res.send(JSON.stringify(true));
}



function get_teams(req, res, next) {
	var qtext = decodeURIComponent(req.query.json);

	console.log('Get teams');

	const dir = 'training/';
	const fs = require('fs');
	var vsprintf = require('sprintf-js').vsprintf;

	var teams = [];	

	fs.readdirSync(dir).forEach(function(filename) {
		if (filename.lastIndexOf("team_", 0) === 0) {
			console.log(filename);
			var tdef = JSON.parse(fs.readFileSync(vsprintf("%s%s", [dir, filename])));

			var rteam = new Object();
			rteam.team_name = tdef.descr;
			rteam.team_id = tdef.team;
			rteam.pokemon = [];

			tdef.pokemons.forEach(function(pkmn) {
				var obj = new Object();
				obj.name = pkmn;
				var filename = get_train_data(tdef.team, pkmn);
				
				
				if (fs.existsSync(filename)) {
					obj.matrix = JSON.parse(fs.readFileSync(filename));
				} else {
					console.log(filename);
					obj.matrix = {};
				}

				rteam.pokemon.push(obj);
			});

			teams.push(rteam);
		}
	})
	
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(teams));

	console.log(JSON.stringify(teams));
}

