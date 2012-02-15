//require socket.io module and let the server listent to port
var io = require('socket.io').listen(8000);

//TODO: explain client-server
//message processing and event handling on wednesday

//connect socket for each logged-in user
io.sockets.on('connection', function (socket) {
	// listen for user registrations from client side
	// then set the socket nickname to 
	socket.on('register', function (name) {
		socket.set('nickname', name, function () {
			
			io.sockets.emit('chat', {
				msg : "Welcome to the Channel " + name + '!',
				msgr : name    
                    });
		    });
	    });
    
    //socket.io triggers the chat event(this is a custom event) 
	socket.on('chat', function (data) {
		//get the username
		var username;
        //this cannot be called before set. Exercise:think about why.	      
		socket.get('nickname', function (err, name) {
			if(!username) {
			    username = name;
			}
        });   
		
		// emit message to all users 
        // Exercise:try use broadcast and see what happens
		io.sockets.emit('chat', {
			msg : data, 
			msgr : username
			    });
	    });
    });