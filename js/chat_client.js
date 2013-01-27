$(document).ready(function () {
    'use strict';
    var socket;
    var server_url = 'ws://sky.rebugged.com:8080/';
    var protocol_identifier = 'chat';
    var nickname = 'Guest-' + Math.floor(Math.random() * 100);
    var myId;

    var msg_bubble_colors = [
        '#FFFFFF',
        '#E2EBC0',
        '#F3F1DC',
        '#F6E1E1',
        '#EDF9FC',
        '#EBF3EC',
        '#F4EAF1',
        '#FCF1F8',
        '#FBFAEF',
        '#EFF2FC'
    ];

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
        nickname = strip_html_tags(nickname);
        show_timer();
        open_connection();

        $('#chat-nickname-form').fadeOut(function () {
            if (myId === undefined) { // if connection not already established
                $('#loading-message').fadeIn();
            }
        });
    }

    function open_connection() {
        socket = new WebSocket(server_url, protocol_identifier);
        socket.addEventListener("open", connection_established);
    }

    function connection_established(event) {
        introduce(nickname);
        socket.addEventListener('message', function (event) {
            message_received(event.data);
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

        if (message.type === 'welcome') {
            myId = message.userId;

            $('#chat-container').fadeIn();
            $('#loading-message').hide();
            $('#welcome-message-user-name').html(nickname);
        } else if (message.type === 'message' && parseInt(message.sender) !== parseInt(myId)) {
            add_new_msg_to_log(message);
        } else if (message.type === 'nicklist') {
            var chatter_list_html = '';

            for(var i in message.nicklist) {
                chatter_list_html += '<li>' + message.nicklist[i] + '</li>';
            }

            chatter_list_html = '<ul>' + chatter_list_html + '</ul>';

            $('#chatter-list').html(chatter_list_html);
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
            message: message,
            sender: myId
        };

        var msg_data_str = JSON.stringify(message_to_send);

        socket.send(msg_data_str);
        add_new_msg_to_log(message_to_send);
    }

    function add_new_msg_to_log(message) {
        var msg_string;
        var bubble_bg_color = msg_bubble_colors[message.sender % msg_bubble_colors.length];

        msg_string  = '<div class="talk-bubble-set hide">';
        msg_string += '    <div class="name">' + strip_html_tags(message.nickname) + '</div>';
        msg_string += '    <div class="bubble">';
        msg_string += '        <span class="msg-text" style="background: ' + bubble_bg_color + '">';
        msg_string +=              strip_html_tags(message.message);
        msg_string +=  '       </span>';
        msg_string += '    </div>';
        msg_string += '</div>';

        $('#message-log-area').append(msg_string);

        $("#message-log-area").animate({
            scrollTop: $("#message-log-area")[0].scrollHeight
        }, 1000);

        $('#message-log-area .talk-bubble-set:last').fadeIn();
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

    function strip_html_tags(text) {
        var temp_element = document.createElement('div');
        temp_element.innerHTML = text.replace(/(<([^>]+)>)/ig, '');
        return temp_element.textContent || temp_element.innerText;
    }
});
