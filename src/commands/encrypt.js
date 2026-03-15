// hello you can use "encrypt --input file.txt --output document.txt.enc --password verySecretRolling"
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { GREEN, RED, RESET } from '../utils/colors.js';

export async function encrypt(args) {
  try {
    const options = parseArgs(args, ['input', 'output', 'password']);

    if (!options.input) {
      throw new Error('--input parameter is required');
    }
    if (!options.output) {
      throw new Error('--output parameter is required');
    }
    if (!options.password) {
      throw new Error('--password parameter is required');
    }

    const inputPath = resolvePath(options.input);
    const outputPath = resolvePath(options.output);
    const password = options.password;

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }

    const stat = fs.statSync(inputPath);
    if (!stat.isFile()) {
      throw new Error(`Input path is not a file: ${inputPath}`);
    }

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);

    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const writeStream = createWriteStream(outputPath);

    writeStream.write(salt);
    writeStream.write(iv);

    await pipeline(
      createReadStream(inputPath),
      cipher,
      writeStream,
      { end: false }
    );

    const authTag = cipher.getAuthTag();
    writeStream.write(authTag);

    await new Promise((resolve, reject) => {
      writeStream.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log(`${GREEN}Encryption completed successfully${RESET}`);
    console.log(`${GREEN}Output saved to: ${outputPath}${RESET}`);

  } catch (err) {
    console.log(`${RED}Operation failed: ${err.message}${RESET}`);
  }
}