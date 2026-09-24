// Fails early with a clear message instead of a cryptic Vite/tsx error.
const [maj, min] = process.versions.node.split('.').map(Number);
if (maj < 20 || (maj === 20 && min < 19) || (maj === 21) || (maj === 22 && min < 12)) {
  console.error(`\n  Node ${process.versions.node} is too old. Install Node 22 LTS (or 20.19+) from https://nodejs.org and try again.\n`);
  process.exit(1);
}
