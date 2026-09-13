import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import type { JSX } from 'solid-js';

vi.mock('panel/stores/dashboard', () => ({
    dashboardState: {
        isCoreRunning: true,
        protectionEnabled: false,
        dnsAddresses: ['192.0.2.1'],
        dnsVersion: 'v2.0.0',
    },
}));

vi.mock('panel/common/ui/Link', () => ({
    Link: (props: { children: JSX.Element; class?: string }) => (
        <a class={props.class}>{props.children}</a>
    ),
}));

vi.mock('panel/common/ui/Icon', () => ({ Icon: () => <span data-testid="diagnostic-icon" /> }));

import { Diagnostics } from 'panel/components/Diagnostics';

describe('Diagnostics', () => {
    it('renders only live service state from the dashboard store', () => {
        render(() => <Diagnostics />);

        expect(screen.getByRole('heading', { name: 'Diagnostics' })).toBeInTheDocument();
        expect(screen.getByText('ONLINE')).toBeInTheDocument();
        expect(screen.getByText('INACTIVE')).toBeInTheDocument();
        expect(screen.getByText('v2.0.0')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });
});
