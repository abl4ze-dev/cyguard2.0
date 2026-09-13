import { closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { spawn, spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import { ADMIN_USERNAME, CONFIG_FILE_PATH, PORT, WORK_DIR_PATH } from '../constants';

const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, '../../..');
const binaryPath = path.join(repositoryRoot, process.platform === 'win32' ? 'cyguard.exe' : 'cyguard');
const configPath = process.env.E2E_CONFIG_PATH ?? CONFIG_FILE_PATH;
const workDir = process.env.E2E_WORK_DIR ?? WORK_DIR_PATH;
const statePath = process.env.E2E_BACKEND_STATE_PATH ?? path.join(path.dirname(configPath), 'backend-process.json');
const logPath = process.env.E2E_BACKEND_LOG_PATH ?? path.join(path.dirname(configPath), 'backend.log');

type BackendState = {
    pid: number;
    binaryPath: string;
    startedAt: number;
};

const isRunning = (pid: number): boolean => {
    try {
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
};

const waitForExit = async (pid: number, timeoutMs: number): Promise<boolean> => {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        if (!isRunning(pid)) return true;
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return !isRunning(pid);
};

const readState = (): BackendState | null => {
    if (!existsSync(statePath)) return null;

    try {
        const state = JSON.parse(readFileSync(statePath, 'utf8')) as BackendState;
        return state.binaryPath === binaryPath && Number.isInteger(state.pid) ? state : null;
    } catch {
        return null;
    }
};

const isExpectedBackend = (state: BackendState): boolean => {
    if (!isRunning(state.pid)) return false;
    if (process.platform !== 'win32') return true;

    const result = spawnSync(
        'powershell.exe',
        [
            '-NoProfile',
            '-NonInteractive',
            '-Command',
            `(Get-Process -Id ${state.pid} -ErrorAction Stop).Path`,
        ],
        { encoding: 'utf8', timeout: 3_000, windowsHide: true },
    );

    return (
        result.status === 0 &&
        path.resolve(result.stdout.trim()).toLowerCase() === path.resolve(state.binaryPath).toLowerCase()
    );
};

export const stopOwnedBackend = async (): Promise<void> => {
    const state = readState();

    if (!state) {
        rmSync(statePath, { force: true });
        return;
    }

    if (isRunning(state.pid) && !isExpectedBackend(state)) {
        throw new Error(`Refusing to terminate PID ${state.pid}: it is not the owned CYGUARD executable`);
    }

    if (isRunning(state.pid)) {
        if (process.platform === 'win32') {
            const graceful = spawnSync('taskkill.exe', ['/pid', String(state.pid), '/t'], {
                stdio: 'ignore',
                timeout: 5_000,
                windowsHide: true,
            });

            if (graceful.status !== 0) {
                try {
                    process.kill(state.pid, 'SIGTERM');
                } catch {
                    // The process may have exited while taskkill was running.
                }
            }

            if (!(await waitForExit(state.pid, 5_000))) {
                const forced = spawnSync('taskkill.exe', ['/pid', String(state.pid), '/t', '/f'], {
                    stdio: 'ignore',
                    timeout: 5_000,
                    windowsHide: true,
                });

                if (forced.status !== 0) {
                    try {
                        process.kill(state.pid, 'SIGKILL');
                    } catch {
                        // The process may have exited while taskkill was running.
                    }
                }
            }
        } else {
            try {
                process.kill(-state.pid, 'SIGTERM');
            } catch {
                // The process may have exited between the liveness check and signal.
            }

            if (!(await waitForExit(state.pid, 5_000))) {
                try {
                    process.kill(-state.pid, 'SIGKILL');
                } catch {
                    // The process may have exited during the grace period.
                }
            }
        }

        if (!(await waitForExit(state.pid, 5_000))) {
            throw new Error(`Owned CYGUARD backend process ${state.pid} did not exit`);
        }
    }

    rmSync(statePath, { force: true });
};

const waitForReady = async (pid: number): Promise<void> => {
    const deadline = Date.now() + 30_000;
    const url = `http://127.0.0.1:${PORT}/login.html`;

    while (Date.now() < deadline) {
        if (!isRunning(pid)) {
            throw new Error(`CYGUARD backend process ${pid} exited before becoming ready`);
        }

        try {
            const response = await fetch(url, { redirect: 'manual' });
            if (response.status < 500) return;
        } catch {
            // The listener is not ready yet.
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`CYGUARD backend process ${pid} was not ready within 30000ms; see ${logPath}`);
};

export const startOwnedBackend = async (): Promise<void> => {
    await stopOwnedBackend();

    mkdirSync(path.dirname(configPath), { recursive: true });

    const prepare = spawnSync(process.execPath, [path.join(here, 'prepareConfig.mjs')], {
        stdio: 'inherit',
        env: {
            ...process.env,
            E2E_CONFIG_PATH: configPath,
            E2E_WORK_DIR: workDir,
            E2E_ADMIN_USERNAME: ADMIN_USERNAME,
            E2E_ADMIN_PASSWORD_HASH:
                process.env.E2E_ADMIN_PASSWORD_HASH ??
                '$2a$10$82RqoFQEf8GcFZwhCk4GFu.KHavhWaNajpZxCkdYsHhToNRe8ljO2',
            E2E_HTTP_PORT: String(PORT),
            E2E_DNS_PORT: process.env.E2E_DNS_PORT ?? '5353',
            E2E_SCHEMA_VERSION: '34',
        },
    });

    if (prepare.status !== 0) {
        throw new Error(`Unable to prepare the E2E configuration (exit ${prepare.status ?? 'unknown'})`);
    }

    const logFd = openSync(logPath, 'a');
    const child = spawn(
        binaryPath,
        ['--local-frontend', '-v', '--no-permcheck', '-c', configPath, '--work-dir', workDir],
        {
            cwd: repositoryRoot,
            detached: true,
            stdio: ['ignore', logFd, logFd],
            windowsHide: true,
        },
    );
    closeSync(logFd);

    if (!child.pid) {
        throw new Error('CYGUARD backend did not provide a process ID');
    }

    writeFileSync(
        statePath,
        JSON.stringify({ pid: child.pid, binaryPath, startedAt: Date.now() } satisfies BackendState),
        'utf8',
    );
    child.unref();

    try {
        await waitForReady(child.pid);
    } catch (error) {
        await stopOwnedBackend();
        throw error;
    }
};

export const cleanOwnedTemporaryFiles = (): void => {
    rmSync(configPath, { force: true });
    rmSync(workDir, { force: true, recursive: true, maxRetries: 10, retryDelay: 200 });
};
