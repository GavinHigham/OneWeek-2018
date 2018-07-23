var express = require('express'), app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(path.join(__dirname, 'public')));

(function() {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;
    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();

const { spawn } = require('child_process');



function run_query(msg, io) {
	const dir = spawn(msg.prefix, [msg.query, msg.suffix]);
	dir.on('error', (err) => {
		console.log('Failed to start child process.');
	});

	dir.stdout.on('data', (data) => {
	  console.log(`stdout: ${data}`);
	  io.emit('chat message', data.toString());
	});

	dir.stderr.on('data', (data) => {
	  console.log(`stderr: ${data}`);
	});

	dir.on('close', (code) => {
	  console.log(`child process exited with code ${code}`);
	});
}

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		io.emit('chat message', JSON.stringify(msg));
		run_query(msg, io);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});