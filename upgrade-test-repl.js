const assert = require('./test/util/assert');
const consensus = require('./lib/protocol/consensus');
const Coin = require('./lib/primitives/coin');
const Script = require('./lib/script/script');
const Opcode = require('./lib/script/opcode');
const FullNode = require('./lib/node/fullnode');
const MTX = require('./lib/primitives/mtx');
const TX = require('./lib/primitives/tx');
const Address = require('./lib/primitives/address');
const Peer = require('./lib/net/peer');
const InvItem = require('./lib/primitives/invitem');
const invTypes = InvItem.types;
const util = require('./lib/utils/util');


const format = require('blgr/lib/format');
const path = require('path');
const cp = require('child_process');

class TestNode extends FullNode {

  constructor(nodeOptions) {

    const myDataDir = path.join(__dirname, `data/datadir_${nodeOptions.index}`);
    cp.spawnSync('rm', ['-rf', myDataDir]);
    cp.spawnSync('mkdir', [myDataDir]);

    super({
      network: 'regtest',
      workers: true,
      logLevel: 'spam',
      listen: true,
      prefix: myDataDir,
      memory: false,
      port: 10000 + nodeOptions.index,
      httpPort: 20000 + nodeOptions.index
      // maxOutbound: 1
    });

    this.index = nodeOptions.index;

    this.logger.logger.writeConsole = function(level, module, args) {

      const printStdout = function(index, data) {
        const header = `${index}:  `;
        let str = data.toString();
        str = str.replace(/\n/g, `\n${header}`);
        str = header + str;
        console.log(`\x1b[${31 + index}m%s\x1b[0m`, str);
      };
      printStdout(this.index, '[' + module + '] ' + format(args, false));
    };

    return this;

  }

  async connect() {

    console.log(`Node ${this.index} connecting!`);

    await this.ensure();
    await this.open();
    await this.connect();
    this.startSync();

    return this;

  }
};




const repl = require('repl');
const goBeCash = repl.start('bcash > ');
goBeCash.context.nodes = [];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const addNode = async function() {

  let newNodeIndex = goBeCash.context.nodes.length;

  let newNode = new TestNode({
    index: newNodeIndex
  });

  goBeCash.context.nodes.push(newNode);
  goBeCash.context['player'+newNodeIndex] = goBeCash.context.nodes[newNodeIndex];

  return true;

};

goBeCash.context.addNode = addNode;

addNode();