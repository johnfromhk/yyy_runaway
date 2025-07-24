const IO = require('../public/io');
const runaway = require('../runaway/runawaymian');
const requireToken = require('../public/requireToken');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runawayentry(args) {
    var outputToConsole = null;
    while (true) {
        console.clear();
        await requireToken.requiretokens(args);//没有token就要token
        if (args['tokens'].size === 0) return;//没要到token，直接退出
        console.clear();
        requireToken.displayinfo(args);
        var des = { x: 8888, y: 8888 };
        console.log('输入想去的坐标，格式是：\nx,y\n，如，输入 8888,8888，用英文逗号分割，默认坐标为狼的基地：8888,8888');
        console.log('输入q. 退出');
        let consoleo = await IO.INPUT('');
        if (consoleo === 'q') return;
        try {
            const [x, y] = consoleo.split(',').map(s => s.trim());
            if (!Number.isNaN(parseInt(x)))
                des.x = parseInt(x);
            if (!Number.isNaN(parseInt(y)))
                des.y = parseInt(y);
        } catch (err) {

        }
        console.log('确定要去', des.x, ',', des.y, '吗？\n输入回车确定\n输入q退出');
        consoleo = await IO.INPUT('');
        if (consoleo === 'q') return;

        if (args['tokens'].size === 1 && outputToConsole === null) outputToConsole = false;
        if (args['tokens'].size > 1 && outputToConsole === null) outputToConsole = false;
        for (let token of args['tokens']) {
            await sleep(500);
            runaway.gotoplace(token, des.x, des.y, true);
        }
        await sleep(1000);
        const opt = await IO.INPUT('\n正在跑路中...  \n按回车键继续跑别的路\n按q返回上级菜单\n');
        if (opt === 'q') return;
    }
}

module.exports = { runawayentry };