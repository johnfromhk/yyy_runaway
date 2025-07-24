const readline = require('readline');
const path = require('path');
const fs = require('fs');
async function INPUT(text = '请输入token:') {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(text, (token) => {
            rl.close();
            resolve(token);
        });
    });
}
function GetKey() {
    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '-key') {
            if (i + 1 < process.argv.length) {
                return process.argv[i + 1];
            }
        }
    }
}
function load(name) {
    let s = fs.readFileSync(name);
    return JSON.parse(s);
}
function save(obj, name) {
    remove(name);
    let jsonStr = JSON.stringify(obj);
    fs.writeFileSync(name, jsonStr);
}
function remove (name){
    try {
        fs.unlinkSync(name);
    } catch (err) { }
}
//返回true为node启动,反之为打包exe启动
function check_node_entry() {
    const execName = path.basename(process.execPath).toLowerCase();
    if (execName === 'node.exe' || execName === 'node') {
        return true;
    } else {
        return false;
    }
}
function parseArgs(argv = process.argv.slice(2)) {
    const args = {};
    let currentKey = null;

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg.startsWith('-')) {
            const key = arg.slice(1);
            // 检查是否是 --key=value 形式
            if (key.includes('=')) {
                const [k, v] = key.split('=');
                args[k] = v;
            } else {
                // 暂存 key，等待下一个值
                currentKey = key;
                // 预设为 true，防止没有值的布尔参数
                args[currentKey] = true;
            }
        }  else if (currentKey) {
            args[currentKey] = arg;
            currentKey = null;
        }
    }

    return args;
}
//检查时间段
function isNowBetween(startHour, startMinute, endHour, endMinute) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
}

module.exports = {
    INPUT: INPUT,
    GetKey: GetKey,
    load: load,
    save: save,
    remove: remove,
    check_node_entry: check_node_entry,
    parseArgs: parseArgs,
    isNowBetween: isNowBetween
};