#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline';

async function readPassword() {
  if (process.argv[2]) {
    return process.argv[2];
  }

  if (process.stdin.isTTY) {
    return new Promise((resolve) => {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      rl.question('Password: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8').trim();
}

const password = await readPassword();
if (!password) {
  console.error('No password provided.');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
console.log(hash);
