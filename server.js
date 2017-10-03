var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(8080, function(){
	var fs = require('fs');
	pokemon = JSON.parse(fs.readFileSync( __dirname + '/pokemon.json'));

    console.log('Server running on 8080...');
});
