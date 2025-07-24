//gtp提供的函数，别问
function extractJsonObjects(input) {
    let jsonObjects = [];
    let depth = 0;
    let start = -1;

    for (let i = 0; i < input.length; i++) {
        if (input[i] === '{') {
            if (depth === 0) start = i;
            depth++;
        } else if (input[i] === '}') {
            depth--;
            if (depth === 0 && start !== -1) {
                try {
                    jsonObjects.push(JSON.parse(input.slice(start, i + 1)));
                    if (jsonObjects.length === 2) break; // 只取前两个 JSON
                } catch (error) {
                    console.error("JSON 解析失败:", error.message);
                }
            }
        }
    }
    return jsonObjects;
}



module.exports = {
    //解压token，获取有效期
    tokenAnalysis: function (token, consoleout = true) {
        const jsons = extractJsonObjects(Buffer.from(token, 'base64').toString('utf-8'));
        //console.log(jsons);
        if (!jsons[1]['uid']) {
            //console.log('这牛马拿个假的token糊弄谁呢！', token);
            throw new Error('这牛马拿个假的token糊弄谁呢！');
        }
        if (consoleout)
            console.log('code：', jsons[1]['code'],
                '保质期', new Date(jsons[1]['end']).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
        if (jsons[1]['end'] <= Date.now()) {
            //console.log('这牛马拿过期的token来糊弄谁呢?');
            throw new Error('这牛马拿过期的token来糊弄谁呢?');
        };
        return {
            code: jsons[1]['code'],
            expDate: new Date(jsons[1]['end']).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
            expTimeStamp: jsons[1]['end'],
            token: token
        };
    }
};