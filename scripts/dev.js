const { spawn } = require('node:child_process');
const path = require('node:path');

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error('Run this command with npm: npm run dev');
}

const services = [
  { name: 'backend', directory: 'backend' },
  { name: 'frontend', directory: 'frontend' },
];
const children = [];
let shuttingDown = false;

for (const service of services) {
  const child = spawn(process.execPath, [npmCli, 'run', 'dev'], {
    cwd: path.join(__dirname, '..', service.directory),
    env: process.env,
    stdio: 'inherit',
  });

  child.on('error', (error) => {
    console.error(`Could not start the ${service.name}:`, error);
  });
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(`${service.name} stopped${signal ? ` after ${signal}` : ` with exit code ${code}`}.`);
    }
  });
  children.push(child);
}

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill(signal);
  }
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
