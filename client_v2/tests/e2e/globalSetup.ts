import { chromium } from '@playwright/test';

import { ADMIN_USERNAME, ADMIN_PASSWORD, PORT } from '../constants';
import { startOwnedBackend, stopOwnedBackend } from './backendLifecycle';

async function globalSetup() {
    await startOwnedBackend();

    const browser = await chromium.launch({
        slowMo: 100,
    });
    const page = await browser.newPage({ baseURL: `http://127.0.0.1:${PORT}` });

    try {
        await page.goto('/');

        const { pathname } = new URL(page.url());

        if (pathname === '/login.html' || pathname === '/') {
            return;
        }

        if (pathname !== '/install.html') {
            throw new Error(`Unexpected initial page during global setup: ${pathname}`);
        }

        // Step 1: Greeting
        await page.locator('#install_get_started').click();

        // Step 2: Auth
        await page.locator('#install_username').fill(ADMIN_USERNAME);
        await page.locator('#install_password').fill(ADMIN_PASSWORD);
        await page.locator('#install_confirm_password').fill(ADMIN_PASSWORD);
        await page.locator('#install_next').click();

        // Step 3: Interface settings
        await page.locator('#install_web_port').fill(PORT.toString());
        await page.locator('#install_next').click();

        // Step 4: DNS settings
        await page.locator('#install_next').click();

        // Step 5: Setup guide
        await page.locator('#install_next').click();

        // Step 6: Submit — open dashboard
        await page.locator('#open_dashboard').click();
        await page.waitForURL((url) => !url.href.endsWith('/install.html'));
    } catch (error) {
        await stopOwnedBackend();
        throw error;
    } finally {
        await browser.close();
    }
}

export default globalSetup;
