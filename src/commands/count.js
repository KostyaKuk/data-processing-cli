import fs from 'node:fs';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { GREEN, RED, RESET } from '../utils/colors.js';

export async function count(args) {
  try {
    const options = parseArgs(args, ['input']);

    if (!options.input) {
      throw new Error('--input parameter is required');
    }

    const inputPath = resolvePath(options.input);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }

    const stat = fs.statSync(inputPath);
    if (!stat.isFile()) {
      throw new Error(`Path is not a file: ${inputPath}`);
    }

    let lines = 0;
    let words = 0;
    let chars = 0;
    let inWord = false;

    const counter = new Transform({
      transform(chunk, encoding, callback) {
        try {
          const text = chunk.toString('utf8');
          chars += text.length;

          for (const char of text) {
            if (char === '\n') {
              lines++;
            }

            if (/\s/.test(char)) {
              inWord = false;
            } else if (!inWord) {
              words++;
              inWord = true;
            }
          }

          callback();
        } catch (err) {
          callback(err);
        }
      },
    });

    await pipeline(
      createReadStream(inputPath, { encoding: 'utf8' }),
      counter
    );

    console.log(`Lines:      ${lines}`);
    console.log(`Words:      ${words}`);
    console.log(`Characters: ${chars}`);

    console.log(`${GREEN}Count completed successfully${RESET}`);

  } catch (err) {
    console.log(`${RED}Operation failed: ${err.message}${RESET}`);
  }
}