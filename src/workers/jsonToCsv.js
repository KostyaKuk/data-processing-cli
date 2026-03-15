import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable, Transform } from 'node:stream';
import { resolvePath } from '../utils/pathResolver.js';
import { parseArgs } from '../utils/argParser.js';
import { GREEN, RED, RESET } from '../utils/colors.js';

export async function jsonToCsv(args) {
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

    const fileContent = await fs.promises.readFile(inputPath, 'utf8');
    
    let jsonData;
    try {
      jsonData = JSON.parse(fileContent);
    } catch (err) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }

    if (!Array.isArray(jsonData)) {
      throw new Error('JSON must be an array of objects');
    }

    const headers = new Set();
    jsonData.forEach(obj => {
      Object.keys(obj).forEach(key => headers.add(key));
    });
    
    const headerArray = Array.from(headers);;

    const readableStream = Readable.from(jsonData);
    const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

    writeStream.write(headerArray.join(',') + '\n');

    const csvTransformer = new Transform({
      objectMode: true,
      transform(obj, encoding, callback) {
        try {
          const row = headerArray.map(header => {
            const value = obj[header];
            if (value === undefined || value === null) return '';
            
            const strValue = String(value);
            if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
              return `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
          }).join(',');

          callback(null, row + '\n');
        } catch (err) {
          callback(err);
        }
      }
    });

    await pipeline(
      readableStream,   
      csvTransformer,   
      writeStream      
    );

    console.log(`${GREEN}Conversion completed successfully!${RESET}`);

  } catch (err) {
    console.log(`${RED}Operation failed: ${err.message}${RESET}`);
  }
}