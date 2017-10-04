var express = require('express');
var app = express();

app.set('port', (8080));
app.use(express.static(__dirname + '/'));

app.listen(app.get('port'), function(){
		var fs = require('fs');
		db_pokemon = JSON.parse(fs.readFileSync( __dirname + '/pokemon.json'));

	    console.log('Server running on http://localhost:8080...');
	});
app.post('/update_matrix', update_matrix); // OR post?


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

function update_matrix(req, res, next) {
	console.log('Time for some action:');

	var qtext = decodeURIComponent(req.query.json);
	var update = JSON.parse(qtext);

	console.log('Update with: %s', qtext);

	// test values
	var team = 'your_mother';
	var pokemon = update.pokemon;
	var attack = update.attack;
	var state = 'none';
	var attack_damage = update.damage;
	var attack_cond = Condition.None;

	// figure out pokemon type
	var poke_entry = lookup_pokemon(pokemon);
	if (!poke_entry) {
		console.log("Pokemon '%s' not found", pokemon);
		return;
	}

	var poke_type = figure_out_type(poke_entry);
	var poke_attack = attack;
	var poke_state = state;


	var fs = require('fs');
	var vsprintf = require('sprintf-js').vsprintf;
	var sanitize = require("sanitize-filename");

	// update our matrix
	var filename = vsprintf('training/train_%s.json', [sanitize(team)]);

	var matrix = fs.existsSync(filename) ?
		JSON.parse(fs.readFileSync(filename)) :
		{};

	var mkey = poke_type + '/' + poke_attack + '/' + poke_state;

	var mval = matrix[mkey];
	var newval = new Object();
	newval.damage = attack_damage;
	newval.cond = attack_cond;

	if (!mval) {
		mval = newval;
	} else {
		if (mval.damage > attack_damage) {
			mval = newval;
		}
	}

	matrix[mkey] = mval;
	fs.writeFileSync(filename, JSON.stringify(matrix));

	res.setHeader('Content-Type', 'application/json');
	console.log(JSON.stringify(matrix));
    res.send(JSON.stringify(matrix));

	// build tree
	// tree = build_tree(matrix);

}