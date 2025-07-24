//引入https模块。通讯用的
const https = require('https');
class Connection {
    //所有链接共享的请求头
    AllHttpHeaders = {
        'Host': 'cat-match.easygame2021.com',
        'Connection': 'keep-alive',
        'b': '913',
        'oaid': '',
        'content-type': 'application/json',
        't': '',
        'Accept-Encoding': 'gzip, compress, br, deflate',
        'User-Agent': 'Mozilla\/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit\/605.1.15 (KHTML, like Gecko) Mobile\/15E148 MicroMessenger\/8.0.56(0x1800383b) NetType\/WIFI Language\/zh_CN',
        'Referer': 'https://servicewechat.com/wx141bfb9b73c970a9/371/page-frame.htm',
        'Content-Type': 'application/json'
    };
    S_CATMATCH = 'cat-match.easygame2021.com';// 服务器地址
    S_STATCATMATCH = 'cat-match-static.easygame2021.com';
    P_GetPlanetCoin = '/sheep/v1/game/planet/get_planet_coin?';//获取金币的路径
    P_GetUserInfo = '/sheep/v1/game/personal_info?';//获取个人信息的路径
    P_PlanetServer = '/sheep/v1/game/planet_server/v2?isByte=true';//plant server的路径
    M_Get = 'GET';
    M_POST = 'POST';
    //长链接
    agent = new https.Agent({
        keepAlive: true,
        maxSockets: 10,
        keepAliveMsecs: 180000
    });
    constructor(token) {
        //console.log('原本的t:', this.AllHttpHeaders['t'], '新的t:',token);
        this.AllHttpHeaders['t'] = token;
    };

    //访问服务器的函数 第一个是服务器地址，
    //第二个是api地址，第三个是POST/ GET，
    //第四个是接收的数据要不要转String,如果为1的话转String,否者不转
    //这是一个阻塞的方法，非阻塞的好像没什么用，不写了
    async connect_to_server(server_address, server_api, method, send_data, NeedString = 1) {
        //console.log("TOKEN", this.AllHttpHeaders['t']);
        this.AllHttpHeaders['Host'] = server_address;
        let agent = this.agent;
        let reqpromise = new Promise((resolve, reject) => {//反正js同步很麻烦
            const sendHeader = {
                hostname: server_address, // 服务器地址
                port: 443, // HTTPS 默认端口
                path: server_api, // 请求路径
                method: method, // 请求方法
                headers: this.AllHttpHeaders,
                agent
            };
            // 创建请求
            const req = https.request(sendHeader, (res) => {
                let data = [];
                //console.log(`状态码: ${res.statusCode}`);
                // 监听数据传输
                res.on('data', (chunk) => {
                    data.push(chunk);
                    //console.log('响应chunck:', chunk);
                });
                // 监听数据接收完成
                res.on('end', () => {
                    //console.log('响应数据:', data);
                    if (NeedString === 1) {
                        resolve(data.toString());
                    } else {
                        let buffer = Buffer.concat(data);//合并buffer
                        resolve(new Uint8Array(buffer));//转成uint8array
                    }

                });
            });
            // 监听错误
            req.on('error', (error) => {
                console.error('请求错误:', error);
                reject(error);
            });
            //添加长度信息
            //console.log(send_data);
            if (send_data && send_data.length > 0) {
                //console.log(send_data.length);
                req.setHeader('Content-Length', Buffer.byteLength(send_data));
                //req.setHeader('Content-Length', send_data.length.toString());
            }
            // 发送请求体
            req.write(send_data);
            // 结束请求
            req.end();
        });
        try {
            //等待结果返回以后返回数据
            const response = await reqpromise;
            //console.log('服务器返回:', response);
            return response;
        } catch (error) {
            console.error('请求失败:', error);
            throw (error);
        };
    };
};
class connect{
    static tokensinfo;
    token = '';
    constructor(token) {
        this.connection = new Connection(token);
        this.token = token;
    }
    //错误处理，用来骂牛马的
    error_process(JP) {
        try {
            switch (JP['err_code']) {
                case 0://成功
                    break;
                case 10003://无效token
                    throw new Error('这个牛马拿看着不假但是其实是假的token');
                    break;
                case 10006://token过期
                    throw new Error('这个牛马的token居然过期了');
                    break;
                case 28001:
                    throw new Error('这个牛马已经过关了还过？！');
                    break;
                case 28002:
                    throw new Error('这个牛马居然自己点了开始？！');
                    break;
                case 33000://大世界没点开始
                    throw new Error('这个牛马大世界都没点开始');
                    break;
                default://藕也不知道是什么错误欸
                    throw new Error('返回值异常，' + '错误代码:' + JP['err_code'].toString()
                        + ',错误消息' + JP['err_msg']);
            }
        } catch (err) {
            //console.log(err);
            if (connect.tokensinfo[this.token]) {
                throw new Error('牛马: ' + connect.tokensinfo[this.token].nick_name
                    + ',uid: ' + connect.tokensinfo[this.token].uid
                    + ',遇到错误，错误信息是：' + err.message
                )
            } else {
                throw new Error('这没缓存过的牛马的t是: ' + this.token
                    + ',遇到错误，错误信息是: ' + err.message
                )
            }
            
        }
    }
    //------------------基础------------------//
    //获取新球币
    async get_plant_coin() {
        //发起连接
        let recive = await this.connection.connect_to_server(
            this.connection.S_CATMATCH,
            this.connection.P_GetPlanetCoin,
            this.connection.M_Get,
            '');
        //转译json 可能有error,不要catch，直接丢出去
        let JP = JSON.parse(recive);
        //处理错误
        this.error_process(JP);
        //返回星球币
        return JP['data']['coinCount'];

    };
    //获取个人信息
    async get_user_info() {
        //发起连接
        let recive = await this.connection.connect_to_server(
            this.connection.S_CATMATCH,
            this.connection.P_GetUserInfo,
            this.connection.M_Get,
            '');
        //转译json 可能有error,不要catch，直接丢出去
        let JP = JSON.parse(recive);
        //处理错误
        this.error_process(JP);
        //更新并返回个人信息
        if (connect.tokensinfo[this.token]) {
            Object.assign(connect.tokensinfo[this.token], JP['data']);
        }
        else {
            connect.tokensinfo[this.token] = JP['data'];
        }
        return JP['data'];
    };
}

module.exports = connect;
