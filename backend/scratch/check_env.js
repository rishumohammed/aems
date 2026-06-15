import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve('../../.env');
console.log('Env Path:', envPath);
console.log('File Exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('File Content (first 100 chars):', content.substring(0, 100));
}

const result = dotenv.config({ path: envPath });
console.log('Dotenv Result:', result.error ? result.error.message : 'Success');
console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? 'DEFINED' : 'UNDEFINED');
