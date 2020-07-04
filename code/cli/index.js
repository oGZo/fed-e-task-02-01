const path = require('path');
const Command = require('common-bin');
const pkg = require('./package.json');
 
class MainCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: homework <command> [options]';
 
    // load entire command directory
    this.load(path.join(__dirname, 'command'));
 
    this.yargs.alias('V', 'version');
  }
}
 
module.exports = MainCommand;