var net = require('net');
//carrier module implements a new-line terminated protocol
//the server will be notified when the client send a message ended
//with a new-line character.
var carrier = require('carrier');

//a list of clients connected
var connectedClients = [];


net.createServer(function(newClient) {
	
	//push the connected client into the connection list
	connectedClients.push(newClient);
	
	//sucessfully connected to the chat server, write a welcome message to the client
	//beware:do not use console.log() for output message here since we are writing the message
	//to the CLIENT, not the console!
	newClient.write("Hi buddy! Welcome to the jungle\n");
	newClient.write("Show us who you are (Your name should be only one word):\n");
	
	/*this is how we usually process data sent by the client:                                                                                     
                  newClient.on('data', function (data) {                                                                                                      
                     do stuff...                                                                                                                              
                  });                                                                                                                                         
	*/
	//but here we use carrier because we want the data sent when client type in a new-line character.                                             
	//keep track of the data parsed by the client(message ended by new-line)   
	var username = null;
	carrier.carry(newClient, function (line) {
		//ask for username
		if(!username) {
		    //regex for checking the valid username
		    var validity = /[\s]*([\w]+)[\s]*/.exec(line);
		    if(validity && !(/[\s]*quit[\s]*/.test(line))) {
			username = validity[1];
			newClient.write("Sup "+username+"!\n");
		    }
		    else {
			newClient.write("Please enter a valid name: ");
		    }
		    return;
		}
		
		//check if the username is valid before processing the message
		if (username) {
		    //feature for quit: when the user types in "quit", we want the server
		    //to close the client socket and remove the client from the list
		    if (/[\s]*quit[\s]*/.test(line)) {
			newClient.end();
			//end() destroy the socket while the server might still send queued data the user typed in
			//until the 'close' event is triggered
		    }
		    
		    //add a header to the message
		    var completeMessage = "\n" + username + "> " + line + "\n";
		    //distributing the message to each listed client
		    for (var index = 0 ; index < connectedClients.length ; index++) {
			connectedClients[index].write(completeMessage);
		    }
		}
	    });

	// close the client socket and remove it from the list
	// beware: the 'close' event should be triggered free of any conditional bounds
	// since we want to trigger the event whenever the user leaves
	newClient.on('close', function () {
		//once the socket is fully closed, remove the client from the list
		var index = connectedClients.indexOf(newClient);
		//use the splice method for removal;
		if (index >= 0) {
		    connectedClients.splice(index, 1);
		}
		
		//inform everyone this user quit
		for(var index = 0 ; index < connectedClients.length ; index++) {
		    connectedClients[index].write("Ooops, we lost " + username + "! Hope people treat " + username + "in the outside world...");
		}
	    });
    }).listen(8000);