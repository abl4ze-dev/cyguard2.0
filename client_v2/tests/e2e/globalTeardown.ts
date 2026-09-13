import { cleanOwnedTemporaryFiles, stopOwnedBackend } from './backendLifecycle';

async function globalTeardown() {
    await stopOwnedBackend();
    cleanOwnedTemporaryFiles();
}

export default globalTeardown;
