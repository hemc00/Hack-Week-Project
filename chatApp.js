var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var minute = 5;
var second = 0;
var countdown;

var poll_data = [{'thumbnail':'https://i.ytimg.com/vi_webp/LygUyAb78oY/mqdefault.webp', 'desc':'Another Bob Ross', 'votes':0},
					{'thumbnail':'https://i.ytimg.com/vi_webp/O6L5YPt9CeU/mqdefault.webp', 'desc':'More Bob Ross', 'votes':0},
					{'thumbnail':'https://i.ytimg.com/vi_webp/m6UM-rN2D6s/mqdefault.webp', 'desc':'There is only Bob Ross', 'votes':0}];

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/test', function(req, res){
  res.send(poll_data);
});

setInterval(function() {
	if( minute || second ) {
		if(second > 0) {
			second--;
		} else {
			second = 59;
			minute--;
		}
	} else {
		minute = 5;
		second = 0;
	}
	
	countdown = second > 9 ? minute+':'+second : minute+':0'+second;
	io.sockets.emit( 'timer', countdown );
}, 1000);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
  socket.on('poll update', function(vote){
    //io.emit('poll update', vote);
    console.log('vote updated: ' + vote);
    var v = JSON.parse(vote);
    inc_votes = poll_data[v.index].votes + 1;
    poll_data[v.index].votes = inc_votes;
    io.emit('poll update', poll_data);
  });
  socket.on('poll init', function() {
    io.emit('poll update', poll_data);
  });
  socket.on('timer', function() {
	io.emit('timer', countdown);
	console.log(countdown);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
