const IO = require('./public/io');
const connect = require('./public/connect');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function welcome() {
    console.log('此版本为开源版，只能找羊跑路。 \n别的功能不存在哟～');
    console.log('版本信息：');
    console.log('整合版本：BETA V1.0');
    console.log('大世界跑图 V1.0');
    console.log('逆天改命 V1.0');
    console.log('特别说明：如果在干饭或者日常的时候强退，请吧tmp目录下的所有文件清空，否者无法正常运行');
    console.log('特别特别重要的说明：如果你想保存缓存的keyiv，请正确关闭本软件（主界面按q退出），否者所有的keyiv都不会被保存');

    //加密验证相关
    
    if (true) {
        await IO.INPUT('按回车键继续:');
    } else {
    }

}


async function selection() {
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
    //console.log(args);
    while (true) {
        //console.log('1. wx双关(被阉割）');
        //console.log('2. 批量双关（仅限缓存过keyiv且keyiv有效的wx号和所有渠道号)（被阉割）');
        console.log('3. 大世界跑图');
        console.log('3f. 大世界找羊');
        //console.log('4. 干饭（被阉割）');
        //console.log('5. 搬桩（被阉割）');
        //console.log('6. 上岸（被阉割）');
        //console.log('7. 麻将');
        //console.log('8. 拔罐');
        //console.log('9. 逆天改命（没被阉割）');
        //console.log('b. 自动领b（被阉割）');
        //console.log('l. 懒人模式（一键双关（含抓羊）/上岸/搬砖/领B)（被阉割）');
        //console.log('wx. 抓keyiv(已经被合并到t选项中)（被阉割）');
        console.log('t. 输入tokens');
        console.log('q. 退出');
        let selection = await IO.INPUT('请选择模式');
        console.clear();
        switch (selection) {
            case '1':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case '2':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case '3':
                console.log('逗你玩呢，没这个功能，换一个');
                console.log('欸欸欸,逗错了，有这个功能');
                const Runaway = require('./runaway/runawaymianentry');
                await Runaway.runawayentry(args);
                break;
            case '3f':
                console.log('逗你玩呢，没这个功能，换一个');
                console.log('欸欸欸,逗错了，有这个功能');
                const Findsheep = require('./runaway/findsheepmian');
                await Findsheep.findsheepEntry(args);
                break;
            case '4':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case '5':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case '6':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case '7':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case '8':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case '9':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case 'b':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case 'l':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case 't':
                const requireToken = require('./public/requireToken');
                await requireToken.requiretokens(args);
                break;
            case 'wx':
                console.log('逗你玩呢，没这个功能，换一个');
                break;
            case 'q':
                try {
                    console.log('正在保存缓存数据，请稍后...');
                    IO.save(args.tokensinfo, './data/tokeninfo.json');
                } catch (err) { console.log('缓存数据保存失败欸，算了算了.'); }
                console.log('等待所有任务完成后自动退出...');
                return 0;
            default:
                console.log('逗我玩呢，没这个功能，换一个');
                break;
        }
        await sleep(1000);
    }
    //保存缓存文件
    
};
async function mian() {
    await welcome();
    await selection();

}

mian();