Springle Chat
=============

Realtime chat using NodeJS and WebSocket

Demo at http://springle.rebugged.com/

(<i>Demo shown at the above link might not reflect the latest changes in code</i>)

## Tech Stack
* WebSocket API (for establishing and maintaining socket connection with the server)
* NodeJS (acts as server and provides evented request handling)
* websocket module for NodeJS (provides support for WebSocket protocol in server.
* Apache (for serving static content)

## Languages
* Javascript

## Database
NIL

## Dependencies
* [Node.js](http://nodejs.org/) (Server side)
* [websocket module](https://github.com/Worlize/WebSocket-Node) for node (Server side)
* A [websocket compliant](http://caniuse.com/websocket) browser (Client side)

## Change Log

###v0.4.2.1
Bug fix
* Now desktop notification code is invoked only after browser support for it is checked.

###v0.4.2
New features
* Direct links to chatrooms
* Desktop notifications for new messages (when chat window not in focus). ([#16](https://github.com/riverspirit/Springle-Chat/issues/16))

###v0.4.1
New features
* SSL support for Websocket communication

###v0.4
New Features
* Added facility to create and join chat rooms ([#5](https://github.com/riverspirit/Springle-Chat/issues/5))
* Some improvisions in fonts used.

###v0.3
New Features
* Sound notification for chat ([#4](https://github.com/riverspirit/Springle-Chat/issues/4))
* Convert to installable HTML5 web app ([#13](https://github.com/riverspirit/Springle-Chat/issues/13))

Fixes
* Prevent users from sending empty messages ([#10](https://github.com/riverspirit/Springle-Chat/issues/10))
* Do not strip away newline characters from messages ([#12](https://github.com/riverspirit/Springle-Chat/issues/12))

###v0.2
New Features
* New and improved UI.
* 'User is typing...' status message ([Ticket #1](https://github.com/riverspirit/Springle-Chat/issues/1))
* Show flashing title bar when there is new activity in the chat page. ([#2](https://github.com/riverspirit/Springle-Chat/issues/2))
* Bug fix: HTML tags in user input are stripped prior to rendering. ([#3](https://github.com/riverspirit/Springle-Chat/issues/3))
* Link to clear chat history.

###v0.1
Features
* Basic functional system with multi-user chat

## License
Source code is released under GNU Affero General Public License v3. See included file `license.txt` for details.



