$(document).ready(function () {
    var socket;
    var server_url = 'ws://sky.rebugged.com:8080/';
    var protocol_identifier = 'chat';
    var nickname = 'Guest-' + Math.floor(Math.random() * 100);

    if (!is_websocket_supported()) {
        $('#chat-nickname-form').html('Your browser <strong>doesnt</strong> support '
                                 + 'websockets :( <br/>Please use an updated version '
                                 + 'of a modern browser, such as <a href="http://www.firefox.com/">Firefox</a> '
                                 + 'or <a href="http://www.google.com/chrome">Google Chrome</a>');
    }

    $('#nickname-submit').click(function () {
        handshake_with_server();
    });

    $('#nickname').keypress(function (e) {
        if (e.which === 13) {
            handshake_with_server();
        }
    });
    
    
    $('#send-btn').click(function () {
        send_msg_box_content();
    });

    $('#msg-box').keypress(function (e) {
        if (e.which === 13 && !e.shiftKey) {
            send_msg_box_content();
            e.preventDefault();
        }
    });

    function handshake_with_server() {
        nickname = $('#nickname').val() !== '' ? $('#nickname').val() : nickname;

        $('#chat-nickname-form').fadeOut(function () {
            $('#loading-message').fadeIn();
        });
        show_timer();
        openConnection();
    }
    
    function openConnection() {
        socket = new WebSocket(server_url, protocol_identifier);

        socket.addEventListener("open", connection_established);
    }
    
    function connection_established(event) {
        introduce(nickname);
        socket.addEventListener('message', function (event) {
            message_received(event.data)
        });

        $('#loading-message').fadeOut(function () {
           $('#chat-container').fadeIn();
        });
    }
    
    function introduce(nickname) {
        var intro = {
            type: 'intro',
            nickname: nickname
        }
        
        socket.send(JSON.stringify(intro));
    }
    
    function message_received(message) {
        var message;
        
        message = JSON.parse(message);
        
        if (message.type === 'message') {
            var msg_string;
            
            msg_string  = '<div class="message">';
            msg_string += '    <span class="msg-from">' + message.nickname + '</span>';
            msg_string += '    <span class="msg-text">' + message.message + '</span>';
            msg_string += '</div>';
            
            $('#chat-log').append(msg_string);
            $("#chat-log").animate({
                scrollTop: $("#chat-log")[0].scrollHeight
            }, 1000);
        } else if (message.type === 'nicklist') {
            var chatter_list_html = '';
            
            for(var i in message.nicklist) {
                chatter_list_html += '<li>' + message.nicklist[i] + '</li>';
            }
            
            chatter_list_html = '<ul>' + chatter_list_html + '</ul>';
            
            $('#people-list-data').html(chatter_list_html);
        }
        
    }

    function send_msg_box_content() {
        var message = $('#msg-box').val();
        send_message(message);
        $('#msg-box').val('');
    }
    
    function send_message(message) {
        var message_to_send = {
            type: 'message',
            nickname: nickname,
            message: message
        };
        
        socket.send(JSON.stringify(message_to_send));
    }

    function is_websocket_supported() {
        if ('WebSocket' in window) {
            return true;
        }
        return false;
    }

    function show_timer() {
        var time_start = 5;
        var time_string;
        var tick = window.setInterval(function () {
            if (time_start-- > 0) {
                time_string = time_start + ' seconds';
            } else {
                time_string = '..ahem ahem, a little more..';
            }
            
            $('#loading-timer').html(time_string);
        }, 1000);
    }
});
