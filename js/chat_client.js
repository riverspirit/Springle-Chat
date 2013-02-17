/**
 * Springle Chat
 *
 * @author Saurabh aka JSX <saurabh@rebugged.com>
 * @copyright 
 * @license GNU AFFERO GENERAL PUBLIC LICENSE v3
 */

$(document).ready(function () {
    'use strict';
    var socket;
    var protocol_identifier = 'chat';
    var nickname = 'Guest-' + Math.floor(Math.random() * 100);
    var chatroom = 'public';
    var myId;
    var nicklist;
    var is_typing_indicator;
    var window_has_focus = true;
    var actual_window_title = document.title;
    var flash_title_timer;

    if (location.protocol === 'http:') {
        var server_url = 'ws://sky.rebugged.com:8804/';
    } else if (location.protocol === 'https:') {
        var server_url = 'wss://sky.rebugged.com:8805/';
    }

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
                                 + 'or <a href="http://www.google.com/chrome">Google Chrome</a>.');
    }

    $('#nickname-submit').click(function () {
        handshake_with_server();
    });

    $('#nickname, #chatroom').keypress(function (e) {
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
        } else {
            send_user_typing_activity_alert();
        }
    });

    $('#clear-log-link').click(function () {
        var clear = confirm('Clear chat log?');
        if (clear) {
            clear_chat_log();
        }
    });

    $(window).focus(function() {
        window_has_focus = true;
        clearInterval(flash_title_timer);
        document.title = actual_window_title;
    });

    $(window).blur(function() {
        window_has_focus = false;
    });

    function handshake_with_server() {
        nickname = $('#nickname').val() !== '' ? $('#nickname').val() : nickname;
        nickname = strip_html_tags(nickname);
        chatroom = $('#chatroom').val() !== '' ? $('#chatroom').val() : chatroom;
        chatroom = strip_html_tags(chatroom);
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
            console.log(event.data)
            message_received(event.data);
        });
    }

    function introduce(nickname) {
        var intro = {
            type: 'intro',
            nickname: nickname,
            chatroom: chatroom
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
            blink_window_title('~ New Message ~');
        } else if (message.type === 'nicklist') {
            var chatter_list_html = '';
            nicklist = message.nicklist;
            for(var i in nicklist) {
                chatter_list_html += '<li>' + nicklist[i] + '</li>';
            }

            chatter_list_html = '<ul>' + chatter_list_html + '</ul>';

            $('#chatter-list').html(chatter_list_html);
        } else if (message.type === 'activity_typing' && parseInt(message.sender) !== parseInt(myId)) {
            var activity_msg = message.name + ' is typing..';
            $('#is-typig-status').html(activity_msg).fadeIn();
            clearTimeout(is_typing_indicator);

            is_typing_indicator = setTimeout(function () {
                $('#is-typig-status').fadeOut();
            }, 2000);
        }

    }

    function send_msg_box_content() {
        var message = $('#msg-box').val();
        if (message != '') {
            send_message(message);
            $('#msg-box').val('');
        }
    }

    function send_message(message) {
        var message_to_send = {
            type: 'message',
            nickname: nickname,
            message: message,
            sender: myId,
            chatroom: chatroom
        };

        var msg_data_str = JSON.stringify(message_to_send);

        socket.send(msg_data_str);
        add_new_msg_to_log(message_to_send);
    }

    function add_new_msg_to_log(message) {
        var msg_string;
        var bubble_bg_color = msg_bubble_colors[message.sender % msg_bubble_colors.length];

        // Lets replace \n characters with html line break before rendering to the user
        var msg_text = strip_html_tags(message.message).split('\n').join('<br />');

        msg_string  = '<div class="talk-bubble-set hide">';
        msg_string += '    <div class="name">' + strip_html_tags(message.nickname) + '</div>';
        msg_string += '    <div class="bubble">';
        msg_string += '        <span class="msg-text" style="background: ' + bubble_bg_color + '">';
        msg_string +=              msg_text;
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
        return temp_element.textContent || temp_element.innerText || '--empty--';
    }

    function send_user_typing_activity_alert() {
        var message_to_send = {
            type: 'activity_typing',
            name: nickname,
            chatroom: chatroom
        };

        var msg_data_str = JSON.stringify(message_to_send);
        socket.send(msg_data_str);
    }

    function clear_chat_log() {
        $('#message-log-area').html('<div class="message-area-padding"></div>');
    }

    function blink_window_title(msg_to_blink) {
        if (!window_has_focus) {
            play_notification_sound();
            
            clearInterval(flash_title_timer);

                flash_title_timer = setInterval(function () {
                    if (document.title === actual_window_title) {
                        document.title = msg_to_blink;
                    } else {
                        document.title = actual_window_title;
                    }
                }, 1000);
            }
    }

    function play_notification_sound() {
        document.getElementById('chat-notification-sound').play();
    }
});
