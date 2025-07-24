const IO = require('../public/io');
const runaway = require('./runawaymian');
const requireToken = require('../public/requireToken');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function worldgethole(token, autofailin) { 
    //大世界占坑
    try {
        const returncode = await runaway.findRandomSheep(token, autofailin, true);
        if (returncode === 0 || returncode === 99) {
            //0: 占坑成功/有坑了 99:打过了，不关心有没有坑了
        }
        else {//未知失败 跳过
            console.log('占坑失败，为什么呢？');
            return;
        };
    } catch (err) {
        console.log('占坑失败，为什么呢？', err.message);
        return;
    }
}

async function findsheepEntry(args) {
    var outputToConsole = null;
    while (true) {
        console.clear();
        await requireToken.requiretokens(args);//没有token就要token
        if (args['tokens'].size === 0) return;//没要到token，直接退出
        console.clear();
        requireToken.displayinfo(args);

        console.log('输入羊id找指定羊\n直接回车或输入0找任意羊')
        console.log('输入q. 退出');
        consoleo = await IO.INPUT('');
        if (consoleo === 'q') return;
        if (consoleo === 'nf') autofailin = -1;
        else if (!Number.isNaN(parseInt(consoleo)))
            autofailin = parseInt(consoleo);
        if (args['tokens'].size === 1 && outputToConsole === null) outputToConsole = false;
        if (args['tokens'].size > 1 && outputToConsole === null) outputToConsole = false;
        for (let token of args['tokens']) {
            await sleep(500);
            worldgethole(token, autofailin);
        }
        await sleep(1000);
        const opt = await IO.INPUT('\n正在找坑中...  \n按回车键继续找别的坑\n按q返回上级菜单\n');
        if (opt === 'q') return;
    }
}


module.exports = {
    findsheepEntry
}