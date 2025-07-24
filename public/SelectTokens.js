const fs = require('fs');
const path = require('path');
const readline = require('readline');

function selectTxtFiles(dir) {
    return new Promise((resolve) => {
        let currentDir = process.cwd() + dir; // 初始目录
        let selectedFiles = []

        function getAllTxtFiles(dir) {
            let fileList = [];
            const items = fs.readdirSync(dir);

            items.forEach(item => {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    fileList = fileList.concat(getAllTxtFiles(fullPath)); // 递归搜索子目录
                } else if (path.extname(item).toLowerCase() === '.txt') {
                    fileList.push(fullPath);
                }
            });

            return fileList;
        }

        function listTxtFiles(dir) {
            const items = fs.readdirSync(dir);
            const files = [];
            const directories = [];

            items.forEach(item => {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    directories.push(item + '/');
                } else if (path.extname(item).toLowerCase() === '.txt') {
                    files.push(item);
                }
            });

            return { directories, files };
        }

        function displayOptions(directories, files) {
            console.log(`\n📂 当前目录: ${currentDir}\n`);
            console.log('📁 目录:');
            if (path.dirname(currentDir) !== currentDir) {
                console.log('  0. 🔙 返回上一级目录');
            }
            directories.forEach((dir, index) => {
                console.log(`  ${index + 1}. 📂 ${dir}`);
            });

            console.log('\n📄 TXT 文件:');
            files.forEach((file, index) => {
                console.log(`  ${index + directories.length + 1}. 📄 ${file}`);
            });

            console.log('\n✅ 其他操作:');
            console.log('  a. ✅ 全选当前目录 TXT 文件');
            console.log('  r. 📂 全选当前目录及其子目录的所有 TXT 文件');
            console.log('  m. ✏️ 选择多个文件');
            console.log('  s. 📋 查看已选择的文件');
            console.log('  q. ✅ 确认并返回已选择的文件');
        }

        function promptUser() {
            const { directories, files } = listTxtFiles(currentDir);
            displayOptions(directories, files);

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('\n请选择一个选项: ', (answer) => {
                if (answer === 'q') {
                    console.clear();
                    console.log('\n📄 你最终选择的文件:');
                    console.log(selectedFiles.length > 0 ? selectedFiles.join('\n') : '（无选择文件）');
                    console.log('\n✅ 选择完成，返回结果。');
                    rl.close();
                    resolve(selectedFiles); // 结束并返回选择的文件列表
                    return;
                }

                if (answer === '0' && path.dirname(currentDir) !== currentDir) {
                    console.clear();
                    currentDir = path.dirname(currentDir);
                    rl.close();
                    promptUser();
                    return;
                }

                if (answer === 'a') {
                    console.clear();
                    selectedFiles = selectedFiles.concat(files.map(f => path.join(currentDir, f)));
                    console.log('✅ 已全选当前目录的 TXT 文件！');
                    rl.close();
                    promptUser();
                    return;
                }

                if (answer === 'r') {
                    console.clear();
                    selectedFiles = selectedFiles.concat(getAllTxtFiles(currentDir));
                    console.log('✅ 已全选当前目录及子目录的 TXT 文件！');
                    rl.close();
                    promptUser();
                    return;
                }

                if (answer === 'm') {
                    rl.question('请输入要选择的文件编号（用空格分隔）: ', (multiAnswer) => {
                        const indexes = multiAnswer.split(' ').map(num => parseInt(num, 10) - 1);
                        indexes.forEach(index => {
                            if (index >= 0 && index < directories.length + files.length) {
                                const selected = index < directories.length ? directories[index] : files[index - directories.length];
                                const fullPath = path.join(currentDir, selected);
                                selectedFiles.push(fullPath);
                            }
                        });
                        console.clear();
                        console.log('✅ 你选择的文件:', selectedFiles);
                        rl.close();
                        promptUser();
                    });
                    return;
                }

                if (answer === 's') {
                    console.clear();
                    console.log('\n📋 你当前已选择的文件:');
                    console.log(selectedFiles.length > 0 ? selectedFiles.join('\n') : '（无选择文件）');
                    rl.close();
                    promptUser();
                    return;
                }
                console.clear();
                const index = parseInt(answer, 10) - 1;
                if (!isNaN(index)) {
                    if (index >= 0 && index < directories.length) {
                        currentDir = path.join(currentDir, directories[index]);
                        rl.close();
                        promptUser();
                    } else if (index >= directories.length && index < directories.length + files.length) {
                        const selectedFile = files[index - directories.length];
                        const fullPath = path.join(currentDir, selectedFile);
                        selectedFiles.push(fullPath);
                        console.log(`✅ 你选择了: ${fullPath}`);
                        rl.close();
                        promptUser();
                    } else {
                        console.log('⚠️ 无效输入，请输入正确的编号。');
                        rl.close();
                        promptUser();
                    }
                } else {
                    console.log('⚠️ 无效输入，请输入正确的编号。');
                    rl.close();
                    promptUser();
                }
            });
        }

        // 启动交互
        promptUser();
    });
}
module.exports = {
    //从文件夹中选择Token
    SelectTokens: async function (dir = '\\Tokens\\ActToken') {
        console.log('📂 请选择 TOKEN 文件...');
        const selectedFiles = await selectTxtFiles(dir);
        const removedDumpselectedFiles = new Set(selectedFiles);
        console.clear();
        console.log('🎉 你最终选择的TOKEN:', removedDumpselectedFiles);
        return removedDumpselectedFiles;
    }
};
//SelectTokens();