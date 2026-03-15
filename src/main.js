import { startRepl } from './repl.js';
import { BLUECOLOR, RESET } from './utils/colors.js';
import { getCurrentDir } from './utils/pathResolver.js';

console.log('Welcome to Data Processing CLI!')
console.log(`You are currently in ${BLUECOLOR}${getCurrentDir()}${RESET}`);

startRepl()