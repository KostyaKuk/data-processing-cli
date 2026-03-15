import fs from 'node:fs';
import path from 'node:path';

import {
  getCurrentDir,
  resolvePath,
  setCurrentDit,
} from './utils/pathResolver.js';
import { BLUECOLOR, GREEN, PINK, RED, RESET } from './utils/colors.js';

export function up() {
  const current = getCurrentDir();

  const parentDir = resolvePath('..');

  if (parentDir === current) {
    return;
  }

  try {
    const stat = fs.statSync(parentDir);

    if (!stat.isDirectory()) {
      console.log(`Error: ${parentDir} is not a directory`);
      return;
    }
    setCurrentDit(parentDir);
    console.log(`Now in:${BLUECOLOR}${getCurrentDir()}${RESET}`);
  } catch (err) {
    console.log(` ${RED}Cannot go up:${err.message}${RESET}`);
  }
}

export function cd(args) {
  if (args.length === 0) {
    console.log('Use: cd *path*');
    return;
  }

  const targetCd = resolvePath(args[0]);

  try {
    const stat = fs.statSync(targetCd);

    if (!stat.isDirectory()) {
      console.log(` ${RED}Error: ${targetCd} is not a directory${RESET}`);
      return;
    }
    setCurrentDit(targetCd);
    console.log(`Now in:${BLUECOLOR}${getCurrentDir()}${RESET}`);
  } catch (err) {
    console.log(` ${RED}cd:${err.message}${RESET}`);
  }
}

export function ls() {
  const dir = getCurrentDir();

  try {
    const entries = fs.readdirSync(dir);

    const folders = [];
    const files = [];

    for (const name of entries) {

      const fullPath = path.join(dir, name);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        folders.push(name);
      } else {
        files.push(name);
      }
    }

    folders.sort((a, b) => a.localeCompare(b));
    files.sort((a, b) => a.localeCompare(b));

    for (const folder of folders) {
      console.log(`${GREEN}${folder.padEnd(20)} [folder]${RESET}`);
    }

    for (const file of files) {
      console.log(`${PINK}${file.padEnd(20)} [file]${RESET}`);
    }

    if (folders.length + files.length === 0) {
      console.log('(empty)');
    }
  } catch (err) {
    console.log(`${RED}Cannot read directory: ${err.message}${RESET}`);
  }
}
