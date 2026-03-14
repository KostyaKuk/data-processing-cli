import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { GREEN, RED, RESET } from '../utils/colors.js';

export async function csvToJson(args) {
  try {

    const options = parseArgs(args, ['input', 'output']);
    
    if (!options.input) {
      throw new Error('--input parameter is required');
    }
    if (!options.output) {
      throw new Error('--output parameter is required');
    }

    const inputPath = resolvePath(options.input);
    const outputPath = resolvePath(options.output);

    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file does not exist: ${inputPath}`);
    }

    const readStream = fs.createReadStream(inputPath, { encoding: 'utf8' });
    const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

    const transformStream = new Transform({
      encoding: 'utf8',
      objectMode: true, 
      construct(callback) {
        this.headers = null;
        this.isFirstChunk = true;
        this.buffer = '';
        this.firstObject = true;
        callback();
      },
      transform(chunk, encoding, callback) {
        try {
          this.buffer += chunk;

          const lines = this.buffer.split('\n');

          this.buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim() === '') continue; 
            
            if (!this.headers) {
              this.headers = line.split(',').map(h => h.trim());
              
              if (this.isFirstChunk) {
                this.push('[\n');
                this.isFirstChunk = false;
              }
            } else {
              const values = line.split(',').map(v => v.trim());
              
              const obj = {};
              this.headers.forEach((header, index) => {
                obj[header] = values[index] || '';
              });
              
              if (!this.firstObject) {
                this.push(',\n');
              }
              this.firstObject = false;
              
              this.push(JSON.stringify(obj, null, 2));
            }
          }
          callback();
        } catch (err) {
          callback(err);
        }
      },
      flush(callback) {
        try {
          if (this.buffer.trim() !== '' && this.headers) {
            const values = this.buffer.split(',').map(v => v.trim());
            const obj = {};
            this.headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            
            if (!this.firstObject) {
              this.push(',\n');
            }
            this.push(JSON.stringify(obj, null, 2));
          }
          
          this.push('\n]');
          callback();
        } catch (err) {
          callback(err);
        }
      }
    });

    await pipeline(
      readStream,
      transformStream,
      writeStream
    );

    console.log(`${GREEN}Conversion completed successfully!${RESET}`);

  } catch (err) {
    console.log(`${RED}Operation failed: ${err.message}${RESET}`);
  }
}