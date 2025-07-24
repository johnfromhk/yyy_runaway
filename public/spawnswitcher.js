const IO = require('../public/io');
const { spawn } = require('child_process');
function spawnswither(runmodel, outputToConsole, ...args) {
    if (outputToConsole)
        if (IO.check_node_entry)
            return spawn('node', [process.argv[1], '-run', runmodel, ...args],{ stdio: 'inherit' });
        else
            return spawn(process.argv[0], ['-run', runmodel, ...args],{ stdio: 'inherit' });
    else
        if (IO.check_node_entry)
            return spawn('node', [process.argv[1], '-run', runmodel, ...args],{});
        else
            return spawn(process.argv[0], ['-run', '-run', runmodel, ...args],{});
}
module.exports = spawnswither;