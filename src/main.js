import { startRepl } from './repl.js';
import { getCurrentDir } from './utils/pathResolver.js';

console.log('Welcome to Data Processing CLI!')
console.log(`You are currently in ${getCurrentDir()}`);

startRepl()