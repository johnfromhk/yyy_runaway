const WebSocket = require('ws');
const crcfunc = require('./crc32');
const worldproto = require('./worldproto');

class runawaycocnnection{
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDc0NjM4MjksInVpZCI6MTIyOTQ2NjU4LCJ2ZXIiOiIxIiwiZXh0IjoiMzYzNzY2NjYzNzYzNjY2MzMwNjEzMjY2NjM2MjM3NjMzMjYzMzMzOTMzNjE2MzMwIiwiY29kZSI6IjhiODg0ZTk5ODZlMjIyOGQ1ZmE0OTVhNDA2NTA3NWJiIiwiZW5kIjoxNzQ3NDYzODI5NzM2LCJwbGEiOjIsIm9zX3R5cGUiOjJ9.clNMeKJMppzuh-JzRn-NHkPp8HdijH8QAOCLZVOUBSQ';
    //初始位置
    initial_pos = {
        x: 0,
        y: 0
    };
    //当前位置
    current_pos = {
        x: 0,
        y: 0
    };


}
module.exports = runawaycocnnection;