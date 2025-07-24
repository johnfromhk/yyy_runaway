const IO = require('./public/io');
async function entrymian() {
    args = IO.parseArgs();
    //console.log(args);
    if (args['run'] !== undefined) {
        switch (args['run']) {
            case 'runaway':
                const RL3 = require('./runaway/runaway');
                return;
        }
    } else {
        require('./mianentry');
        return;
    }
}

const fs = require('fs');
fs.mkdir('data', { recursive: true }, (err) => {
});
fs.mkdir('log', { recursive: true }, (err) => {
});
fs.mkdir('tmp', { recursive: true }, (err) => {
});
fs.mkdir('Tokens', { recursive: true }, (err) => {
});
fs.mkdir('Tokens/ActToken', { recursive: true }, (err) => {
});
fs.mkdir('Tokens/AutoSavedTokens', { recursive: true }, (err) => {
});
fs.mkdir('Tokens/ExpToken', { recursive: true }, (err) => {
});
entrymian();