import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { copyFile, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const { build } = require('@vercel/node');
const builderRequire = createRequire(require.resolve('@vercel/node'));
const { FileFsRef } = builderRequire('@vercel/build-utils');

test('Vercel-built login functions can import their shared helper at runtime', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'genz-auth-build-'));
  try {
    await mkdir(path.join(fixture, 'api'));
    await mkdir(path.join(fixture, 'src/lib'), { recursive: true });
    for (const file of ['api/auth.ts', 'api/callback.ts', 'src/lib/admin-oauth.js', 'tsconfig.json']) {
      await copyFile(path.join(root, file), path.join(fixture, file));
    }
    // Use existing dependencies without running installs or the site's build scripts.
    await writeFile(path.join(fixture, 'package.json'), JSON.stringify({ type: 'module', engines: { node: '22.x' } }));
    await symlink(path.join(root, 'node_modules'), path.join(fixture, 'node_modules'), 'junction');

    for (const entrypoint of ['api/auth.ts', 'api/callback.ts']) {
      const { output } = await build({
        files: { [entrypoint]: new FileFsRef({ fsPath: path.join(root, entrypoint) }) },
        entrypoint,
        workPath: fixture,
        config: { zeroConfig: true, projectSettings: { installCommand: '' } },
        considerBuildCommand: true,
      });
      assert.ok(output.files['src/lib/admin-oauth.js'], `${entrypoint}: helper missing from ${Object.keys(output.files).join(', ')}`);
      const runtime = path.join(fixture, path.basename(entrypoint, '.ts'));
      for (const [name, file] of Object.entries(output.files)) {
        if (!name.endsWith('.js') && name !== 'package.json') continue;
        const stream = await file.toStream();
        const content = await new Promise((resolve, reject) => {
          const chunks = [];
          stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', reject);
        });
        await mkdir(path.dirname(path.join(runtime, name)), { recursive: true });
        await writeFile(path.join(runtime, name), content);
      }
      // Import the deployed JS output, not the TypeScript source used by unit tests.
      const handler = await import(pathToFileURL(path.join(runtime, output.handler)).href);
      assert.equal(typeof handler.default, 'function');
    }
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
