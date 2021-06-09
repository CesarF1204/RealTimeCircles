const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');

const app = express();
//body parser
app.use(bodyParser.urlencoded({extended: true}));
//views
app.use(express.static(__dirname + "/views"));
//assets
app.use(express.static(__dirname + "/assets"));
//ejs
app.set('view engine', 'ejs');
//routes
app.get("/", function(request, response) {
    response.render("index");
});
//port
const server = app.listen(8000, function() {
	console.log("listening on port 8000");
});
let users = []; //this handles the multiple users
let username = {}; //this handles the new user created
let color = ''; //this handles the color
const io = require('socket.io')(server);    // socket.io connection
io.sockets.on('connection', function(socket) {  // Establishing a connection with user
	console.log("Connected: "+ socket.connected);
	socket.on("new_user", function(data) { // handling the new user creation with socket id
		username[socket.id] = data.name;
		users.push({name: username[socket.id], socketid: socket.id});
		console.log(users);
		io.emit("user_entered_room", users); //broadcasting the user that enters the room
		socket.broadcast.emit("user_joined_room", username[socket.id]);
	});
	//disconnect
	socket.on("disconnect", function(){ // handling the disconnection of a user
		for(let i=0; i<users.length; i++){
            if(users[i].socketid == socket.id){
                users[i] = users[users.length-1];
                users.pop();
                break;
            }
        }
		io.emit("user_disconnect", username[socket.id]);
		console.log(users);
	})
	//colors
	socket.on("colors_clicked", function(data) { //handling the choses color of a user and appending a circle on click by the user
        color = 'yellow';
        console.log('You emitted the following information to the server: ' + data.color);
		let circle_random_size = Math.floor(Math.random() * 300);
		io.emit("user_create_circle", {response: `<div style='border: 1px solid black; width: ${circle_random_size}px; height: ${circle_random_size}px; position: absolute; top: ${data.y-200}px; left: ${data.x-200}px; border-radius: 360px; background-color: ${data.color}'><p class='username'>${username[socket.id]}</p></div>`});
		console.log(data);
	});
});
