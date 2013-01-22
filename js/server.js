var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

var clients = [];

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('chat', request.origin);

    clients.push(connection);
    console.log('-------- ' + clients.length)
    //console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log(message.utf8Data)
            var msgObj = JSON.parse(message.utf8Data);
            
            if (msgObj.type === 'intro') {
                connection.nickname = msgObj.nickname;
                broadcast_chatters_list();
            } else if (msgObj.type === 'message') {
                console.log('Received Message: ' + message.utf8Data);
                broadcast_message(message.utf8Data);
            }
        } else if (message.type === 'binary') {
            connection.sendUTF('Invalid message');
        }
    });
    
    setInterval(function() {
        send_poke();
    }, 3000);

    connection.on('close', function(reasonCode, description) {
        console.log(connection.nickname)
        console.log('-------- ' + clients.length)
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
    
    function broadcast_message(message) {
        for (var i in clients) {
            clients[i].sendUTF(message);
        }
    }
    
    function broadcast_chatters_list() {
        var nicklist = [];
        var msg_to_send;
        
        for (var i in clients) {
            nicklist.push(clients[i].nickname);
        }
        
        msg_to_send = JSON.stringify({
            type: 'nicklist',
            nicklist: nicklist
        });
        console.log(msg_to_send);
        broadcast_message(msg_to_send);
    }
    
    function send_poke() {
        var msg = JSON.stringify({
            type: 'message',
            nickname: '#BOT#',
            message: 'This is an automated message from the server.'
        });
        
        broadcast_message(msg);
    }
    

});
