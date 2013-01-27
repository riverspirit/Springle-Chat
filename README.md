Websocket-Chat
==============

Realtime chat using NodeJS and WebSocket

Demo at http://rebugged.com/code/websocket-chat/

(<i>Demo shown at the above link might not reflect the latest changes in code</i>)

## Tech Stack
* WebSocket API (for establishing and maintaining socket connection with the server)
* NodeJS (acts as server and provides evented request handling)
* websocket module for NodeJS (provides support for WebSocket protocol in server.

## Languages
* Javascript

## Database
NIL

## Dependencies
* [Node.js](http://nodejs.org/) (Server side)
* [websocket module](https://github.com/Worlize/WebSocket-Node) for node (Server side)
* A [websocket compliant](http://caniuse.com/websocket) browser (Client side)

# Change Log

###v0.2
New Features
* New and improved UI.
* 'User is typing...' status message ([Ticket #1](https://github.com/riverspirit/Websocket-Chat/issues/1))
* Show flashing title bar when there is new activity in the chat page. ([Ticket #2](https://github.com/riverspirit/Websocket-Chat/issues/2))
* Bug fix: HTML tags in user input are stripped prior to rendering. ([Ticket #3](https://github.com/riverspirit/Websocket-Chat/issues/3))
* Link to clear chat history.

###v0.1
Features
* Basic functional system with multi-user chat
