const soawnswitcher = require('../public/spawnswitcher');
function findRandomSheep(token, autofailin, outputToConsole = false) {
    return new Promise((resolve, reject) => {
        var child = soawnswitcher('runaway', outputToConsole,
            '-token', token, '-findsheep', autofailin
        );
        child.on('exit', (code) => {
            resolve(code);
        });
        child.on('error', (err) => {
            reject(err);
        });
    });

};
function gotoplace(token,x,y, outputToConsole = false) {
    return new Promise((resolve, reject) => {
        var child = soawnswitcher('runaway', outputToConsole,
            '-token', token, '-x', x, '-y', y
        );
        child.on('exit', (code) => {
            resolve(code);
        });
        child.on('error', (err) => {
            reject(err);
        });
    });

};

module.exports = {
    findRandomSheep,
    gotoplace
}