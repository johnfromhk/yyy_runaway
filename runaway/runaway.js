const WebSocket = require('ws');
const IO = require('../public/io');
const crcfunc = require('./crc32');
const worldproto = require('./worldproto');
const connect = require('../public/connect');
const logger = require('../public/log');
const runawaylog = new logger('log/runawaylog.txt');
//传递参数用，引用传递，不要修改对象本身
var args = {
    tokens: new Set(),
    tokensinfo: {}
};
//加载缓存文件
try {
    args.tokensinfo = IO.load('./data/tokeninfo.json');
} catch (err) { }
connect.tokensinfo = args.tokensinfo;//同步tokensinfo

async function mian() {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const Minx = 13600;
    const Miny = 15600;
    const speed_delay = 500;

    const args = IO.parseArgs();
    if (!args['token']) process.exit(-1);//没t
    var wsURL = `wss://cat-match.easygame2021.com/gateway/ws?token=${args['token']}&login_type=0&bn=608&misc_type=%7B%22isReliable%22%3Atrue%7D`;
    //获取个人信息
    var nick_name, uid;
    try {
        const S1 = new connect(args['token']);
        const UserInfo = await S1.get_user_info();
        nick_name = UserInfo['nick_name'];
        uid = UserInfo['uid'];
    } catch (err) {
        runawaylog.log('这牛马的t有问题,他的t是', args['token']);
        console.log(err);
        process.exit(-1);
    }
    //目标
    var target_pos = {
        x: parseInt(args['x']) ? parseInt(args['x']) : 8888,
        y: parseInt(args['y']) ? parseInt(args['y']) : 8888
    };
    var findsheep = false;
    if (args['findsheep']) findsheep = true;
    
    var findsheepid = parseInt(args['findsheep']) ? parseInt(args['findsheep']) : 0;//指定羊id
    let socket = null;
    let tt = null;
    async function send_ack() {
        let hb_buffer = new Buffer.from(['0x02', '0x03', '0xe9', '0x00', '0x6b', '0xe1', '0xb7', '0x06']);
        await socket.send(new Uint8Array(hb_buffer)); // 心跳包
    }
    var tried = 0;//连接次数
    const max_try = 5;//最大重连次数
    function createWebSocket() {
        tried++;
        if (tried > max_try) {
            runawaylog.log('牛马:', nick_name, ',uid:', uid, ',重连超量，放弃');
            process.exit(-1);
        }

        try {
            socket = new WebSocket(wsURL);
            init();
        } catch (e) {
            runawaylog.log('牛马:', nick_name, ',uid:', uid, ',链接异常，准备重试')
            reconnect(wsURL);
        }
    }
    var lockReconnect = false;//避免重复连接
    function reconnect(url) {
        if (lockReconnect) {
            return;
        };
        lockReconnect = true;
        //没连接上会一直重连，设置延迟避免请求过多
        tt && clearTimeout(tt);
        tt = setTimeout(function () {
            createWebSocket(url);
            lockReconnect = false;
        }, 5000);
    }
    function onHeartBeatAckInfo(buff) {
        if (buff.length === 0) {
        } else {
        }
    }
    async function onUserLoginNtfInfo(buff) {
        if (buff.length === 0) {
        } else {
            const buff_str = worldproto.decode("UserLoginNtfInfo", buff);
            var cur_Coord = buff_str.userData.curCoord
            if (findsheep) {
                //1是有羊了，2是打完了
                if (buff_str.userData.curState === 1) {
                    runawaylog.log('牛马:', nick_name, ',uid:', uid, '，不是有坑了么？还抓羊');
                    process.exit(0);
                }
                if (buff_str.userData.curState === 2) {
                    runawaylog.log('牛马:', nick_name, ',uid:', uid, '，不是打过了么？还抓羊');
                    process.exit(99);
                }
                target_pos.x = cur_Coord.x;
                target_pos.y = Miny - cur_Coord.y;
            }
            
            runawaylog.log('牛马:', nick_name, ',uid:', uid, "，当前坐标：", cur_Coord.x, Miny-cur_Coord.y);
            await sleep(speed_delay);  // 延时
            heartCheck.PingStart();
        }
    }
    function onUserMoveReqInfo(buff) {
        if (buff.length > 0) {
            const buff_str = worldproto.decode("UserMoveReqInfo", buff);
        }
    }
    async function onUserMoveAckInfo(buff) {
        if (buff.length > 0) {
            const buff_str = worldproto.decode("UserMoveAckInfo", buff);
        }
    }
    async function onCheckInAckInfo(buff) {
        if (buff.length > 0) {
            const buff_str = worldproto.decode("CheckInAckInfo", buff);
            console.log('牛马:', nick_name, ',uid:', uid, "，打卡成功");
        }
    }
    function onUserOccupyGiftReqInfo(buff) {
        if (buff.length > 0) {
            const buff_str = worldproto.decode("UserOccupyGiftReqInfo", buff);
        }
    }
    //计算2点之间的距离
    function calculate_distance(p1, p2) {
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    }
    //查找最近的点
    function findmin(gifts, target_pos) {
        var min_distance = 99999;//最小距离
        var pos_at_min_distance = { x: target_pos.x, y: target_pos.y };//默认值
        //选一个最近的
        for (const gift of gifts) {
            if (calculate_distance(gift.curCoord, target_pos) < min_distance) {
                min_distance = calculate_distance(gift.curCoord, target_pos);
                pos_at_min_distance = gift.curCoord;
            }
        }
        return pos_at_min_distance;
    }
    function findneblesheep(gifts) {
        for (const gift of gifts) {
            if (gift.giftStage === 1) {
                if (findsheepid === 0 || findsheepid === gift.giftId)
                    return gift.curCoord;
            }
        }
        return false;
    }
    function pickRandomExceptFirst(list) {
        if (list.length <= 3) {
            process.exit(-2);
        }
        const index = Math.floor(Math.random() * (list.length - 3)) + 1;
        return list[index];
    }
    var outputcounter = 0;//输出计数器，每20条输出一条
    let gifts;//全局gifts变量
    async function onAllGiftNearByNtfInfo(buff) {
        if (buff.length > 0) {
            outputcounter++;
            const buff_str = worldproto.decode("AllGiftNearByNtfInfo", buff);
            gifts = buff_str.gifts;
            await sleep(speed_delay);  // 延时
            if (findsheep) {//找羊
                const sheep = findneblesheep(gifts);
                if (sheep) {//附近有羊
                    //羊在原地
                    if (gifts[0].curCoord.x == sheep.x && gifts[0].curCoord.y == sheep.y) {
                        if (findsheepid === 0 || findsheepid === gifts[0].giftId) {
                            runawaylog.log('牛马:', nick_name, ',uid:', uid, '，在(',
                                gifts[0].curCoord.x, ',', Miny - gifts[0].curCoord.y,')找到咸阳了，羊是：', gifts[0].giftId);
                            await send_occupy(gifts[0].giftUid);
                        } else {//羊在原地 走开
                            await sendMove(pickRandomExceptFirst(gifts).curCoord);
                        }
                    } else {//羊不在原地 走过去
                        if (outputcounter % 20 === 0) {
                            runawaylog.log('牛马:', nick_name, ',uid:', uid,
                                '，现在在(', gifts[0].curCoord.x, ',', Miny - gifts[0].curCoord.y,
                                `)，走了(${-target_pos.x + gifts[0].curCoord.x}, ${-Miny + target_pos.y + gifts[0].curCoord.y})步`);
                        }
                        await sendMove(sheep);
                    }
                } else {//附近没羊
                    if (outputcounter % 20 === 0) {
                        runawaylog.log('牛马:', nick_name, ',uid:', uid,
                            '，现在在(', gifts[0].curCoord.x, ',', Miny - gifts[0].curCoord.y,
                            `)找羊，走了(${-target_pos.x + gifts[0].curCoord.x}, ${-Miny + target_pos.y + gifts[0].curCoord.y})步`);
                    }
                    await sendMove(pickRandomExceptFirst(gifts).curCoord);
                }
            } else {//跑路
                if (outputcounter % 20 === 0) {
                    runawaylog.log('牛马:', nick_name, ',uid:', uid,
                        '，现在在(', gifts[0].curCoord.x, ',', Miny-gifts[0].curCoord.y,
                        `)，还差(${target_pos.x - gifts[0].curCoord.x}, ${Miny - target_pos.y - gifts[0].curCoord.y})步`);
                }
                if (gifts[0].curCoord.x == target_pos.x && gifts[0].curCoord.y == Miny - target_pos.y) {
                    runawaylog.log('牛马:', nick_name, ',uid:', uid,
                        '，到达目的地：(', gifts[0].curCoord.x, ',', Miny-gifts[0].curCoord.y, ')');
                    process.exit(0);
                    return;
                }
                const next_pos = findmin(gifts,
                    { x: target_pos.x, y: Miny - target_pos.y });
                await sendMove(next_pos);
            }
        }
    }
    async function send_occupy(giftUid) {
        var sendData = worldproto.encode("UserOccupyGiftReqInfo", { giftUId: giftUid });
        var totalBuffer = crcfunc(1102, sendData);
        await sleep(speed_delay);
        await socket.send(totalBuffer); // 占领
        await sleep(speed_delay);
        heartCheck.PingStart();
    }

    const onAllUserNearByNtfInfo = (buff) => {
        if (buff.length > 0) {
            const buff_str = worldproto.decode("AllUserNearByNtfInfo", buff);
        }
    }

    async function sendMove(pos) {
        const usermovereqinfo = { targetCoord: pos };// 传入坐标
        const sendData2 = worldproto.encode("UserMoveReqInfo", usermovereqinfo); // 编码
        //拼接数据并发送
        const totalBuffer2 = crcfunc(1100, sendData2);
        await socket.send(totalBuffer2);
    }

    async function onUserOccupyGiftAckInfo(buff) {
        if (buff.length === 0) {
        } else {
            var buff_str = worldproto.decode("UserOccupyGiftAckInfo", buff);
            if (buff_str.code === 0) {
                runawaylog.log('牛马:', nick_name, ',uid:', uid, ",占坑成功！")
                process.exit(0);
            }
            else {
                runawaylog.log('牛马:', nick_name, ',uid:', uid, ",占领失败，找找别的坑");
                await sleep(500);
                await sendMove(pickRandomExceptFirst(gifts).curCoord);
            }
        }
        heartCheck.PingStart();
    }

    const OPCODE_HANDLER = {
        1002: onHeartBeatAckInfo,
        1003: onUserLoginNtfInfo,
        1100: onUserMoveReqInfo,
        1101: onUserMoveAckInfo,
        1102: onUserOccupyGiftReqInfo,
        1103: onUserOccupyGiftAckInfo,
        1111: onCheckInAckInfo,
        1120: onAllGiftNearByNtfInfo,
        1121: onAllUserNearByNtfInfo,
    }


    //心跳检测
    var heartCheck = {
        timeout: 3000, //每隔5秒发送心跳
        num: 3, //3次心跳均未响应重连
        timeoutObj: null,
        serverTimeoutObj: null,
        reset: function () {
            clearTimeout(this.serverTimeoutObj);
            return this;
        },
        PingStart: function () {
            var _num = this.num;
            this.timeoutObj && clearTimeout(this.timeoutObj);
            this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
            this.timeoutObj = setTimeout(function () {
                //这里发送一个心跳，后端收到后，返回一个心跳消息，
                //onmessage拿到返回的心跳就说明连接正常
                send_ack();
                // self.PingStart();// 心跳包
                // socket.send("123456789"); // 心跳包
                _num--;
                //计算答复的超时次数
                if (_num === 0) {
                    socket.colse();
                }
            }, this.timeout)
        },
        PongStart: function () {
            var self = this;
            self.serverTimeoutObj = setTimeout(function () { //如果超过一定时间还没重置，说明后端主动断开了
                if (socket != null) {
                    runawaylog.log('牛马:', nick_name, ',uid:', uid, "，服务器10秒没有响应，关闭连接")
                    socket.close();
                }
            }, 5 * 1000)
        }
    }

    function init() {
        socket.onopen = () => {
            heartCheck.PingStart();
        }
        socket.onmessage = (msg) => {
            if (socket != null) {
                heartCheck.reset().PongStart(); //拿到任何消息都说明当前连接是正常的 心跳检测重置
            }
            const data = msg.data;

            const buffer = new Uint8Array(data);
            const opCode = parseInt(buffer[1] << 8 | buffer[2]);
            if (opCode === 1002) {
                console.log("receive heart beat....")
                return;
            }
            if (OPCODE_HANDLER[opCode]) {
                OPCODE_HANDLER[opCode](buffer.slice(3));
            }
            heartCheck.PingStart();
        }
        socket.onclose = (e) => {
            runawaylog.log('牛马:', nick_name, ',uid:', uid, "链接关闭");
            reconnect(wsURL);
        }
        socket.onerror = (e) => {
            runawaylog.log('牛马:', nick_name, ',uid:', uid, "链接异常")
            reconnect(wsURL);
        }
    }


    createWebSocket()
};
mian();