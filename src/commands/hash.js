import fs from 'node:fs';
import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { GREEN, RED, RESET } from '../utils/colors.js';
import path from 'node:path';

export async function hash(args) {
  try {
    const options = parseArgs(args, ['input', 'algorithm', 'save']);

    if (!options.input) {
      throw new Error('--input parameter is required');
    }

    const algorithm = options.algorithm || 'sha256';

    const supported = ['sha256', 'md5', 'sha512'];
    if (!supported.includes(algorithm)) {
      throw new Error(
        `Operation failed this is unsupported algorithm: ${algorithm}. Supported: ${supported.join(', ')}`,
      );
    }

    const inputPath = resolvePath(options.input);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }

    const stat = fs.statSync(inputPath);
    if (!stat.isFile()) {
      throw new Error(`Path is not a file: ${inputPath}`);
    }

    const hash = crypto.createHash(algorithm);

    await pipeline(
      createReadStream(inputPath),
      hash,
    );

    const hashValueHex = hash.digest('hex');

    console.log(`${algorithm}: ${hashValueHex}`);

    if ('save' in options) {
      const dir = path.dirname(inputPath);
      const base = path.basename(inputPath);
      const hashFileName = `${base}.${algorithm}`;
      const hashFilePath = path.join(dir, hashFileName);

      fs.writeFileSync(hashFilePath, hashValueHex, 'utf8');

      console.log(`${GREEN}Hash saved to: ${hashFilePath}${RESET}`);
    }

    console.log(`${GREEN}Hash calculation completed successfully${RESET}`);
  } catch (err) {
    console.log(`${RED}Operation failed: ${err.message}${RESET}`);
  }
}
