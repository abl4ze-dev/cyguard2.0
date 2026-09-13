import { createEffect, onMount, onCleanup, Show } from 'solid-js';
import { HashRouter, Route, Navigate, useLocation } from '@solidjs/router';

import { Sidebar } from 'panel/common/ui/Sidebar';
import { Icons } from 'panel/common/ui/Icons';
import { Footer } from 'panel/common/ui/Footer';
import { Header } from 'panel/common/ui/Header';
import { Banners } from 'panel/common/ui/Banners';
import { Settings } from 'panel/components/Settings';
import intl, { LocalesType } from 'panel/common/intl';
import { Encryption } from 'panel/components/Encryption';
import { Blocklists } from 'panel/components/FilterLists/Blocklists';
import { LOCAL_STORAGE_KEYS, LocalStorageHelper } from 'panel/helpers/localStorageHelper';

import { Allowlists } from 'panel/components/FilterLists/Allowlists';
import { DNSRewrites } from 'panel/components/FilterLists/DNSRewrites';
import { SetupGuide } from 'panel/components/SetupGuide';
import { Dashboard } from 'panel/components/Dashboard';
import { Dhcp } from 'panel/components/Dhcp';
import { LeasesPage } from 'panel/components/Dhcp/LeasesPage';
import { QueryLog } from 'panel/components/QueryLog';
import { Toasts } from 'panel/components/Toasts';
import { THEMES } from '../../helpers/constants';
import { setHtmlLangAttr, setUITheme } from '../../helpers/helpers';
import { getDnsStatus, getTimerStatus, dashboardState } from '../../stores/dashboard';

import s from './styles.module.pcss';
import { DnsSettings } from '../DnsSettings';
import { PrivateReverse } from '../DnsSettings/PrivateReverse';
import { UserRules } from '../UserRules';
import { BlockedServices } from '../BlockedServices';
import { Clients } from '../Clients/Clients';
import { InactivitySchedule } from '../BlockedServices/InactivitySchedule';
import { AddClient } from '../Clients/AddClient';
import { Protection } from '../Clients/AddClient/blocks/Protection/Protection';
import { ClientBlockedServices } from '../Clients/AddClient/blocks/ClientBlockedServices';
import { ClientSchedule } from '../Clients/AddClient/blocks/ClientSchedule';
import { Paths } from '../Routes/Paths';
import {
    TopClientsPage,
    TopQueriedDomainsPage,
    TopBlockedDomainsPage,
    TopUpstreamsPage,
    UpstreamAvgTimePage,
} from '../Stats';
import { Diagnostics } from '../Diagnostics';

const getPageTitle = (path: string): string | undefined => {
    switch (path) {
        case Paths.Dashboard:
            return intl.getMessage('cyguard_nav_dashboard');
        case Paths.ScanCenter:
            return intl.getMessage('cyguard_nav_scan');
        case Paths.NetworkActivity:
            return intl.getMessage('cyguard_nav_network');
        case Paths.ThreatProtection:
            return intl.getMessage('cyguard_nav_threats');
        case Paths.Devices:
            return intl.getMessage('cyguard_nav_devices');
        case Paths.Privacy:
            return intl.getMessage('cyguard_nav_privacy');
        case Paths.Reports:
            return intl.getMessage('cyguard_nav_reports');
        case Paths.FlaggedSites:
            return intl.getMessage('cyguard_nav_flagged');
        case Paths.SettingsPage:
            return intl.getMessage('cyguard_nav_settings');
        case Paths.Diagnostics:
            return intl.getMessage('cyguard_nav_diagnostics');
        default:
            return undefined;
    }
};

const PageTitleSync = (): null => {
    const location = useLocation();
    createEffect(() => {
        const section = getPageTitle(location.pathname);
        document.title = section ? `CYGUARD — ${section}` : 'CYGUARD — Cybersecurity & Privacy Protection';
    });
    return null;
};

const SetupGuideRoute = () => <SetupGuide />;
const BlockedServicesRoute = () => <BlockedServices />;
const InactivityScheduleRoute = () => <InactivitySchedule />;
const ClientScheduleRoute = () => <ClientSchedule />;
const ClientBlockedServicesRoute = () => <ClientBlockedServices />;
const ProtectionRoute = () => <Protection />;
const AddClientRoute = () => <AddClient />;

const App = () => {
    onMount(() => {
        getDnsStatus();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                getTimerStatus();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        onCleanup(() => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        });
    });

    // React to language changes
    createEffect(() => {
        const language = dashboardState.language;
        const processing = dashboardState.processing;
        if (!processing && language) {
            intl.changeLanguage(language as LocalesType).then(() => {
                setHtmlLangAttr(language);
                LocalStorageHelper.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, language);
            });
        }
    });

    // React to theme changes
    createEffect(() => {
        const theme = dashboardState.theme;

        if (!theme) return;

        if (theme !== THEMES.auto) {
            setUITheme(theme);
            return;
        }

        const colorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        setUITheme(theme);

        const handleChange = (e: MediaQueryListEvent) => {
            if (e.matches) {
                setUITheme(THEMES.dark);
            } else {
                setUITheme(THEMES.light);
            }
        };

        colorSchemeMedia.addEventListener('change', handleChange);
        onCleanup(() => {
            colorSchemeMedia.removeEventListener('change', handleChange);
        });
    });

    return (
        <HashRouter
            root={(props) => (
                <>
                    <PageTitleSync />
                    <Header />

                    <Banners />

                    <div class={s.wrapper}>
                        <Sidebar />

                        <Show when={!dashboardState.processing && dashboardState.isCoreRunning}>
                            <div class={s.bodyWrapper}>{props.children}</div>
                        </Show>
                    </div>

                    <Footer />

                    <Toasts />

                    <Icons />
                </>
            )}
        >
            <Route path={Paths.Dashboard} component={Dashboard} />
            <Route path={Paths.ScanCenter} component={UserRules} />
            <Route path={Paths.NetworkActivity} component={QueryLog} />
            <Route path={Paths.ThreatProtection} component={Blocklists} />
            <Route path={Paths.Devices} component={Clients} />
            <Route path={Paths.Privacy} component={Encryption} />
            <Route path={Paths.Reports} component={Dashboard} />
            <Route path={Paths.FlaggedSites} component={TopBlockedDomainsPage} />
            <Route path={Paths.Diagnostics} component={Diagnostics} />
            <Route path={Paths.TopClients} component={TopClientsPage} />
            <Route path={Paths.TopQueriedDomains} component={TopQueriedDomainsPage} />
            <Route path={Paths.TopBlockedDomains} component={TopBlockedDomainsPage} />
            <Route path={Paths.TopUpstreams} component={TopUpstreamsPage} />
            <Route path={Paths.UpstreamAvgTime} component={UpstreamAvgTimePage} />
            <Route path={Paths.SettingsPage} component={Settings} />
            <Route path={Paths.Encryption} component={Encryption} />
            <Route path={Paths.Dns} component={DnsSettings} />
            <Route path={Paths.DnsPrivateReverse} component={PrivateReverse} />
            <Route path={Paths.DnsBlocklists} component={Blocklists} />
            <Route path={Paths.DnsAllowlists} component={Allowlists} />
            <Route path={Paths.CustomRules} component={UserRules} />
            <Route path={Paths.DnsRewrites} component={DNSRewrites} />
            <Route path={Paths.Dhcp} component={Dhcp} />
            <Route path={Paths.DhcpLeases} component={LeasesPage} />
            <Route path={Paths.Guide} component={SetupGuideRoute} />
            <Route path={Paths.Logs} component={QueryLog} />
            <Route path={Paths.InactivitySchedule} component={InactivityScheduleRoute} />
            <Route path={Paths.BlockedServices} component={BlockedServicesRoute} />
            <Route path={Paths.ClientsSchedule} component={ClientScheduleRoute} />
            <Route path={Paths.ClientsBlockedServices} component={ClientBlockedServicesRoute} />
            <Route path={Paths.ClientsProtection} component={ProtectionRoute} />
            <Route path={Paths.ClientsAdd} component={AddClientRoute} />
            <Route path={Paths.ClientsEditSchedule} component={ClientScheduleRoute} />
            <Route path={Paths.ClientsEditBlockedServices} component={ClientBlockedServicesRoute} />
            <Route path={Paths.ClientsEditProtection} component={ProtectionRoute} />
            <Route path={Paths.ClientsEdit} component={AddClientRoute} />
            <Route path={Paths.Clients} component={Clients} />
            <Route path="/" component={() => <Navigate href="/dashboard" />} />
        </HashRouter>
    );
};

export default App;
