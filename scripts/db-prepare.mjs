#!/usr/bin/env node
/**
 * Wrapper: fuerza development + CI y corre db-prepare.ts
 * (NODE_ENV es read-only si se asigna desde un .ts ya cargado).
 */
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const here = dirname(fileURLToPath(import.meta.url))
const script = join(here, 'db-prepare.ts')

const r = spawnSync(
  process.execPath,
  ['--import', 'tsx', '--env-file=.env', script],
  {
    stdio: 'inherit',
    cwd: join(here, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      CI: 'true',
    },
  },
)

process.exit(r.status ?? 1)
