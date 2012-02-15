//start when the page documents are fully loaded
//Jquery
$(document).ready(function(){
    var name = '';
    var socket = io.connect('http://localhost:8000');
    
    // ask for the name of the user, ask again if no name.
	while (name == '') {
	    name = prompt("What's your name?","");
	}
    
    // send the name to the server, and the server's 
	// register wait will recieve this and send the name to server
	socket.emit('register', name);
    
    //buffer the message until return is hit
	var input = $('#msg');
    input.keypress(function(event){
		if (event.keyCode != 13) return;
        var msg = input.attr('value');
		// send the message back to the server to server
		if(msg) {
            socket.emit('chat', msg);
            //clear the input buffer
            input.attr('value','');
        }
    });	
    
    // listen for chat event and recieve data from the server
    socket.on('chat', function (data) {
        // print data (jquery thing)
        $("#chatLog").append("<li>" + data.msgr + ': ' + data.msg + "</li>");
        //scroll the output, keyboard input always focus on the input element
        window.scrollBy(0, -1000000000000000);
        input.focus();
    });
});
