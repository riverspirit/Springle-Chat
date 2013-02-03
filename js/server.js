/**
 * Springle Chat
 *
 * @author Saurabh aka JSX <saurabh@rebugged.com>
 * @copyright 
 * @license GNU AFFERO GENERAL PUBLIC LICENSE v3
 */

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    response.writeHead(404);
    response.end();
});

var clients = [];

var allowed_origins = [
    'localhost',
    'springle.rebugged.com'
];

var allowed_protocol = 'chat';

var connection_id = 0;

server.listen(8804, function() {
    console.log((new Date()) + ' Server is listening on port 8804');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    var origin_trimmed = origin.replace('http://', '')
                               .replace('https://', '');
                       
    if (allowed_origins.indexOf(origin_trimmed) > -1) {
        return true;
    }

    return false;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      return;
    }

    if (request.requestedProtocols.indexOf(allowed_protocol) === -1) {
        request.reject();
        return false;
    }

    var connection = request.accept('chat', request.origin);
    connection.id = connection_id++;

    clients.push(connection);
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            //console.log(message.utf8Data)
            var msgObj = JSON.parse(message.utf8Data);
            
            if (msgObj.type === 'intro') {
                connection.nickname = msgObj.nickname;

                connection.sendUTF(JSON.stringify({
                    type: 'welcome',
                    userId:connection.id
                }));

                broadcast_chatters_list();
            } else if (msgObj.type === 'message') {
                console.log(message);

                message_to_send = JSON.parse(message.utf8Data);
                message_to_send['sender'] = connection.id.toString();
                message_to_send = JSON.stringify(message_to_send);

                console.log(message_to_send)
                broadcast_message(message_to_send);
            } else if (msgObj.type.match(/^activity_/)) {
                // echo back any message type that start with activity_
                message_to_send = JSON.parse(message.utf8Data);
                message_to_send['sender'] = connection.id.toString();
                message_to_send = JSON.stringify(message_to_send);

                broadcast_message(message_to_send);
            }
        } else if (message.type === 'binary') {
            // At the moment, we are handling only text messages - no binary
            connection.sendUTF('Invalid message');
        }
    });
    

    connection.on('close', function(reasonCode, description) {
        for (var i in clients) {
            if (connection.id === clients[i].id) {
                clients.splice(i, 1);
                broadcast_chatters_list();
            }
        }
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
        broadcast_message(msg_to_send);
    }
    
    function send_poke() {
        var msg = JSON.stringify({
            type: 'message',
            nickname: 'Bot',
            message: 'This is an automated message from the server.'
        });
        
        broadcast_message(msg);
    }
    

});
