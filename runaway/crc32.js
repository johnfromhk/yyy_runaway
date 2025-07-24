const CRC32 = require('crc-32')
var ws_idx = 0;
function writeUint16(e, t, o) {
    e[t] = (65280 & o) >> 8, e[t + 1] = 255 & o;
}
function writeCRC32(e, t, o) {
    e[t + 3] = (4278190080 & o) >> 24, e[t + 2] = (16711680 & o) >> 16, e[t + 1] = (65280 & o) >> 8,
        e[t] = 255 & o;
}
function crcfunc(opcode, orig_buff) {
    //console.log('ws_idx:',ws_idx);
    const o = opcode;
    cachedMsgHeader = new Uint8Array(4); // 本来是3 改为4 方便插个值进去
    cachedMsgHeaderForHttp = new Uint8Array(2);
    let s = cachedMsgHeader;
    let r = ws_idx;
    ws_idx += 1;
    ws_idx %= 256;
    writeUint16(s, 1, o);
    s[3] = r;
    s[0] = 2;
    let p1 = [...s];
    let p2 = p1;
    if (orig_buff != null)
        p2 = p1.concat([...orig_buff]);
    const myHashValue = CRC32.buf(p2, 0);
    const hex2 = [255 & myHashValue, (65280 & myHashValue) >> 8, (16711680 & myHashValue) >> 16, (4278190080 & myHashValue) >> 24];
    var p3 = p2.concat(hex2);
    let msg = new Uint8Array(p3);
    // console.log("sendmsg",msg);
    return msg;
    // socket.send(msg);
}
module.exports = crcfunc;