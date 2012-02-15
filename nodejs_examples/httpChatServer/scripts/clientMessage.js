//mapping for emoticons
var emoticons = {
    "kidding":"areyoufuckingkiddingme.png",
    "asoo":"asoo.png",
    "cry":"epiccry.png",
    "fap":"fapfapfap.png",
    "ffff":"ffff.png",
    "alone":"foreveralonedance.gif",
    "bitchplease":"fuckthatshit.png",
    "fuckyea":"fuckyea.png",
    "fuuu":"fuuu.png",
    "derp":"herpderp.png",
    "hipster":"hipsterlink.jpg",
    "ladies":"ladies.jpg",
    "letsdothis":"letsdothis.png",
    "lol":"lololol.gif",
    "megusta":"megusta.jpg",
    "nobody":"nobody.jpg",
    "nowkiss":"nowkiss.jpg",
    "okay":"okaywalk.gif",
    "omg":"omgomgomg.gif",
    "trolldad":"trolldad.png",
    "yuno":"yuno.png"
}

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
        //let's troll on message processing!!
        var emoticonTest = /(.*)\\(.*)\\(.*)/.exec(data.msg);
        if(emoticonTest && emoticons[emoticonTest[2]]) {
            $("#chatLog").append("<li>" + data.msgr + ': ' + emoticonTest[1] +
            "<img" + " src=\"emoticons/" + emoticons[emoticonTest[2]] + "\"" + 
            " alt=\"" + emoticonTest[2] +"\" />" +emoticonTest[3] + "</li>");
        }
        else {
            // print data (jquery thing)
            $("#chatLog").append("<li>" + data.msgr + ': ' + data.msg + "</li>");
        }
        //scroll the output, keyboard input always focus on the input element
        window.scrollBy(0, -1000000000000000);
        input.focus();
    });
});
