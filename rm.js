const fs = require('fs');
const dirs = ['node_modules', 'apps/api/node_modules', 'apps/web/node_modules', 'apps/movil/node_modules'];
for (const dir of dirs) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log('Removed ' + dir);
    }
  } catch (e) {
    console.error('Failed to remove ' + dir, e.message);
  }
}
