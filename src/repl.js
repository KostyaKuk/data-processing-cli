import readline from 'node:readline';
import { BLUECOLOR, PINK, RESET } from './utils/colors.js';
import { cd, ls, up } from './navigation.js';
import { csvToJson } from './workers/csvToJson.js';
import { jsonToCsv } from './workers/jsonToCsv.js';
import { count } from './commands/count.js';
import { hash } from './commands/hash.js';
import { hashCompare } from './commands/hashCompare.js';
import { encrypt } from './commands/encrypt.js';
import { decrypt } from './commands/decrypt.js';
import { getCurrentDir } from './utils/pathResolver.js';

export function startRepl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>',
  });

  rl.prompt();

  rl.on('line', async (input) => {
    const line = input.trim();

    if (!line) {
      rl.prompt();
      return;
    }

    const [command, ...args] = line.split(/\s+/);
    switch (command.toLowerCase()) {
      case '.exit':
      case 'exit':
        rl.close();
        return;

      case 'up':
        up();
        break;

      case 'cd':
        cd(args);
        break;

      case 'ls':
        ls();
        break;

      case 'csv-to-json':
        await csvToJson(args);
        break;

      case 'json-to-csv':
        await jsonToCsv(args);
        break;

      case 'count':
        await count(args);
        break;

      case 'hash':
        await hash(args);
        break;

      case 'hash-compare':
        await hashCompare(args);
        break;

      case 'encrypt':
        await encrypt(args);
        break;

      case 'decrypt':
        await decrypt(args);
        break;

      default:
        console.log(`Unknown command: ${command}`);
    }

    showCurrentDirectory()
    rl.prompt();
  });

    function showCurrentDirectory() {
    console.log(`\n${BLUECOLOR} ${getCurrentDir()}${RESET}`);
  }

  rl.on('SIGINT', () => {
    rl.close();
  });

  rl.on('close', () => {
    console.log(`\n${PINK}Thank you for using Data Processing CLI!${RESET}`);
    process.exit(0);
  });
}
