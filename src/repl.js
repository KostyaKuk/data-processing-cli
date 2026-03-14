import readline from 'node:readline';
import { PINK, RESET } from './utils/colors.js';
import { getCurrentDir } from './utils/pathResolver.js';

export function startRepl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>',
  });

  rl.prompt();

  rl.on('line', (input) => {
    const line = input.trim();

    if (line === '.exit' || line === 'exit') {
      rl.close();
      return;
    }

    if (line.length > 0) {
      console.log('good command');
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.log('\n^C');
    rl.close();
  });

  rl.on('close', () => {
    console.log('\n^C');
    console.log(`\n${PINK}Thank you for using Data Processing CLI!${RESET}`);
    process.exit(0);
  });
}
