const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = path.join(__dirname, '..', 'node_modules', 'better-sqlite3', 'build', 'Release');
const targetFile = path.join(targetDir, 'better_sqlite3.node');

if (fs.existsSync(targetFile)) {
  console.log('better_sqlite3.node already exists.');
  process.exit(0);
}

async function main() {
  console.log('Downloading prebuilt better-sqlite3 binary...');
  const url = 'https://github.com/WiseLibs/better-sqlite3/releases/download/v9.4.3/better-sqlite3-v9.4.3-node-v115-win32-x64.tar.gz';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch binary: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const tempTar = path.join(__dirname, '..', 'temp_better_sqlite.tar.gz');
  fs.writeFileSync(tempTar, buffer);

  const extractTo = path.join(__dirname, '..', 'node_modules', 'better-sqlite3');
  fs.mkdirSync(extractTo, { recursive: true });
  execSync(`tar -xzf "${tempTar}" -C "${extractTo}"`, { stdio: 'inherit' });
  if (fs.existsSync(tempTar)) {
    fs.unlinkSync(tempTar);
  }
  console.log('better-sqlite3 native binary setup complete.');
}

main().catch((err) => {
  console.error('Failed to setup better-sqlite3:', err);
  process.exit(1);
});
