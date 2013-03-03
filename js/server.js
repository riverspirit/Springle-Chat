/**
 * Springle Chat
 *
 * @author Saurabh aka JSX <saurabh@rebugged.com>
 * @copyright 
 * @license GNU AFFERO GENERAL PUBLIC LICENSE v3
 */

var WebSocketServer = require('websocket').server;

// Check if SSL support is enabled
if (process.argv.indexOf('--enable-ssl') !== -1) {
    var https = require('https');
    var fs = require('fs');

    var options = {
        key: fs.readFileSync('/home/conf/ssl.key'),
        cert: fs.readFileSync('/home/conf/ssl.crt')
    };

    var server = https.createServer(options, function(request, response) {
        response.writeHead(404);
        response.end();
    });

    var port = 8805;
    var server_start_message = (new Date()) + ' Springle server with SSL is listening on port ' + port;
} else {
    var http = require('http');

    var server = http.createServer(function(request, response) {
        response.writeHead(404);
        response.end();
    });

    var port = 8804;
    var server_start_message = (new Date()) + ' Springle server is listening on port ' + port;
}



var clients = [];
var chat_rooms = {};

var allowed_origins = [
    'localhost',
    'springle.rebugged.com',
    'sky.rebugged.com',
    'developer.cdn.mozilla.net'
];

var allowed_protocol = 'chat';

var connection_id = 0;

server.listen(port, function() {
    console.log(server_start_message);
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
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var msgObj = JSON.parse(message.utf8Data);
            
            if (msgObj.type === 'intro') {
                connection.nickname = msgObj.nickname;
                connection.chatroom = msgObj.chatroom;

                if (chat_rooms[msgObj.chatroom] !== undefined) {
                    chat_rooms[msgObj.chatroom].push(connection);
                } else {
                    chat_rooms[msgObj.chatroom] = [connection];
                }

                connection.sendUTF(JSON.stringify({
                    type: 'welcome',
                    userId:connection.id
                }));

                broadcast_chatters_list(msgObj.chatroom);
            } else if (msgObj.type === 'message') {

                message_to_send = JSON.parse(message.utf8Data);
                message_to_send['sender'] = connection.id.toString();
                message_to_send = JSON.stringify(message_to_send);

                console.log(message_to_send)
                broadcast_message(message_to_send, msgObj.chatroom);
            } else if (msgObj.type.match(/^activity_/)) {
                // echo back any message type that start with activity_
                message_to_send = JSON.parse(message.utf8Data);
                message_to_send['sender'] = connection.id.toString();
                message_to_send = JSON.stringify(message_to_send);

                broadcast_message(message_to_send, msgObj.chatroom);
            }
        } else if (message.type === 'binary') {
            // At the moment, we are handling only text messages - no binary
            connection.sendUTF('Invalid message');
        }
    });
    

    connection.on('close', function(reasonCode, description) {
        var chatroom = connection.chatroom;
        var users = chat_rooms[chatroom];

        for (var i in users) {
            if (connection.id === users[i].id) {
                chat_rooms[chatroom].splice(i, 1);
                broadcast_chatters_list(connection.chatroom);
            }
        }
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
    
    function broadcast_message(message, chatroom) {
        var users = chat_rooms[chatroom];

        for (var i in users) {
            users[i].sendUTF(message);
        }
    }
    
    function broadcast_chatters_list(chatroom) {
        var nicklist = [];
        var msg_to_send;
        var users = chat_rooms[chatroom];
        
        for (var i in users) {
            nicklist.push(users[i].nickname);
        }
        
        msg_to_send = JSON.stringify({
            type: 'nicklist',
            nicklist: nicklist
        });

        broadcast_message(msg_to_send, chatroom);
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
