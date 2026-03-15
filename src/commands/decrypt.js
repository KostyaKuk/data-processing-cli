// you can use "decrypt --input document.txt.enc --output newfile.txt --password verySecretRolling"
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { GREEN, RED, RESET } from '../utils/colors.js';

export async function decrypt(args) {
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

    const fileSize = stat.size;

    if (fileSize < 44) {
      throw new Error('Input file is too small to be a valid encrypted file');
    }

    const fd = fs.openSync(inputPath);

    const saltBuffer = Buffer.alloc(16);
    fs.readSync(fd, saltBuffer, 0, 16, 0);
    
    const ivBuffer = Buffer.alloc(12);
     fs.readSync(fd, ivBuffer, 0, 12, 16);

    const authTag = Buffer.alloc(16);
    fs.readSync(fd, authTag, 0, 16, fileSize - 16);

    fs.closeSync(fd);

    const key = crypto.pbkdf2Sync(password, saltBuffer, 100000, 32, 'sha256');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuffer);

    decipher.setAuthTag(authTag);

    const readStream = createReadStream(inputPath, {
      start: 28, 
      end: fileSize - 17,
    });

    const writeStream = createWriteStream(outputPath);

    await pipeline(readStream, decipher, writeStream);

    console.log(`${GREEN}Decryption completed successfully${RESET}`);
    console.log(`${GREEN}Output saved to: ${outputPath}${RESET}`);
  } catch (err) {
    console.log(`${RED}Operation failed: ${err.message}${RESET}`);
  }
}
