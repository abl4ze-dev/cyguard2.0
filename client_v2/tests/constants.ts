import os from 'node:os';
import path from 'node:path';

export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'superpassword';
export const PORT = 3000;
const E2E_TEMP_ROOT = path.join(os.tmpdir(), 'cyguard-e2e');
export const CONFIG_FILE_PATH = path.join(E2E_TEMP_ROOT, 'CYGUARD.e2e.yaml');
export const WORK_DIR_PATH = path.join(E2E_TEMP_ROOT, 'work');
