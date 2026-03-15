import fs from 'node:fs';
import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { GREEN, RED, RESET } from '../utils/colors.js';

export async function hashCompare(args) {
  try {
    const options = parseArgs(args, ['input', 'hash', 'algorithm']);

    if (!options.input) {
      throw new Error('--input parameter is required');
    }

    if (!options.hash) {
      throw new Error('--hash parameter is required');
    }

    const algorithm = options.algorithm || 'sha256';

    const supported = ['sha256', 'md5', 'sha512'];
    if (!supported.includes(algorithm)) {
      throw new Error(
        `Operation failed unsupported algorithm: ${algorithm}. Supported: ${supported.join(', ')}`
      );
    }

    const inputPath = resolvePath(options.input);
    const hashPath = resolvePath(options.hash);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }

    if (!fs.existsSync(hashPath)) {
      throw new Error(`Hash file does not exist: ${hashPath}`);
    }

    const inputStat = fs.statSync(inputPath);
    if (!inputStat.isFile()) {
      throw new Error(`--input is not a file: ${inputPath}`);
    }

    const hashStat = fs.statSync(hashPath);
    if (!hashStat.isFile()) {
      throw new Error(`--hash is not a file: ${hashPath}`);
    }

    let expectedHash = fs.readFileSync(hashPath, 'utf8').trim();

    expectedHash = expectedHash.replace(/\r?\n$/, '').toLowerCase();

    const hasher = crypto.createHash(algorithm);

    await pipeline(createReadStream(inputPath), hasher);

    const actualHash = hasher.digest('hex').toLowerCase();

    if (actualHash === expectedHash) {
      console.log(`${GREEN}OK${RESET}`);
    } else {
      console.log(`${RED}MISMATCH${RESET}`);
    }

  } catch (err) {
    console.log(`${RED}Operation failed: ${err.message}${RESET}`);
  }
}