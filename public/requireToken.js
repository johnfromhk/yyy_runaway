const logger = require('../public/log');
const tokenlog = new logger('log/tokenErr.txt');
const decodeToken = require('./tokenAnalysis');
const IO = require('./io');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function displayinfo(args) {
    if (args['tokens'].size > 0) {
        console.log('当前已经加载的token');
        for (let token of args['tokens']) {
            try {
                const dtoken = decodeToken.tokenAnalysis(token, false);
                //console.log((args['tokensinfo'][token]));
                if (!(args['tokensinfo'][token])) {
                    const connect = require('./connect');
                    const S1 = new connect(token);
                    //console.log('正在连接服务器获取信息...');
                    const tokeninfo = await S1.get_user_info();
                    //args['tokensinfo'][token] = tokeninfo;
                    sleep(500);
                };
                console.log('羊名：', args['tokensinfo'][token]['nick_name'],
                    ',uid:', args['tokensinfo'][token]['uid'],
                    ',保质期:', dtoken['expDate']
                );
            } catch (err) {
                if (args.tokensinfo[token]) {
                    tokenlog.log('牛马: ' + args.tokensinfo[token].nick_name
                        + ',uid: ' + args.tokensinfo[token].uid
                        + ',遇到错误，错误信息是: ' + err.message
                    )
                } else {
                    console.log('这没缓存过的牛马的t是: ' + token
                        + ',遇到错误，错误信息是: ' + err.message
                    )
                }
                args['tokens'].delete(token);
            }
        };
    };
};
async function loadTokenFromFile(args, filespath) {
    const fs = require('fs');
    for (let filepath of filespath) {
        const data = fs.readFileSync(filepath, 'utf8');
        const tokens = data.split(/\r?\n/); // 兼容 Windows 和 Linux 的换行符
        tokens.forEach((token) => {
            try {
                decodeToken.tokenAnalysis(token);
                //尝试添加一条新的token
                args['tokens'].add(token);//添加一条新的token
            } catch (err) {
                if (args.tokensinfo[token]) {
                    tokenlog.nlog('牛马: ' + args.tokensinfo[token].nick_name
                        + ',uid: ' + args.tokensinfo[token].uid
                        + ',遇到错误，错误信息是: ' + err.message
                    )
                }
            }
        });
    }
};
async function select_from_cache(args) {

}
async function saveTokens(args) {
    const now = new Date();
    const tokenfile = now.toISOString().replace(/[:.]/g, '-').replace('T', '_')+'.txt';
    const autoSavedTokenLog = new logger('Tokens/ActToken/AutoSavedTokens/autoSavedToken' + tokenfile);
    for (const token of args.tokens) {
        try {
            autoSavedTokenLog.ntimestampnlog(
                '牛马: ', args.tokensinfo[token].nick_name
                , ',uid: ', args.tokensinfo[token].uid
                , ',保质期至：', decodeToken.tokenAnalysis(token).expDate,
                ',Token是\n', token,'\n'
            );
        } catch (err) { }
    }
    console.clear();
    console.log('Tokens 已经被保存到/Tokens/ActToken/AutoSavedTokens/autoSavedToken' + tokenfile);
    await IO.INPUT('按回车键继续');
}
async function requiretokens(args) {
    
    var loadmore = false;
    while (true) {
        console.clear();
        await displayinfo(args);
        console.log('请输入token');
        if (loadmore) console.log('当前模式：输入多个token,不会覆盖原有token');
        else console.log('当前模式：输入单个token,覆盖之前所有的token');
        console.log('输入q或者直接回车返回上级菜单');
        console.log('输入f从文件中加载token');
        //console.log('输入l从缓存中加载token');
        console.log('输入c清除所有已输入的token');
        console.log('输入s保存所有已输入的token');
        //console.log('输入wx使用微信抓取keyiv（被阉割）');
        if (!loadmore) console.log('输入ts手动输入多条token,否者新输入的token会覆盖之前的token');
        else console.log('输入t改成输入单个token,覆盖之前所有的token');
        console.log('不输入token将使用列表上的token');
        let token = await IO.INPUT('');
        if (token === 'q' || token === '') {
            break;
        }
        if (token === 't') {
            loadmore = false;
            continue;
        }
        /*if (token === 'l') {
            await select_from_cache(args);
            continue;
        }*/
        if (token === 's') {
            await saveTokens(args);
            continue;
        }
        if (token === 'ts') {
            loadmore = true;
            continue;
        }
        if (token === 'f') {
            loadmore = true;
            const SelectTokens = require('./SelectTokens');
            const Tokenfiles = await SelectTokens.SelectTokens();
            loadTokenFromFile(args, Tokenfiles);
            continue;
        }
        if (token === 'c') {
            args['tokens'].clear();//清空Set
            continue;
        }
        try {
            const decodeToken = require('./tokenAnalysis');
            decodeToken.tokenAnalysis(token);
            //尝试添加一条新的token
            if (loadmore) {
                args['tokens'].add(token);//添加一条新的token
                continue;
            } else {
                args['tokens'].clear();//清空Set
                args['tokens'].add(token);//添加新token
                continue;//如果没有要输入多条token就直接退出
            }
        } catch (err) {
            if (args.tokensinfo[token]) {
                tokenlog.log('牛马: ' + args.tokensinfo[token].nick_name
                    + ',uid: ' + args.tokensinfo[token].uid
                    + ',遇到错误，错误信息是: ' + err.message
                )
            } else {
                console.log('这没缓存过的牛马的t是:' + token
                    + ',遇到错误，错误信息是: ' + err.message
                )
            }
            await IO.INPUT('无效token,按回车继续:');
            continue;
        }
        //await IO.INPUT('按回车键继续');
    }
}
module.exports = {
    displayinfo: displayinfo,
    requiretokens: requiretokens
};