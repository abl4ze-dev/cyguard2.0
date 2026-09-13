import { useLocation } from '@solidjs/router';
import cn from 'clsx';
import { For } from 'solid-js';
import { Icon } from 'panel/common/ui/Icon';
import type { IconType } from 'panel/common/ui/Icon';
import { Link } from 'panel/common/ui/Link';
import { Paths, RoutePath, type RoutePathKey } from 'panel/components/Routes/Paths';
import theme from 'panel/lib/theme';
import intl from 'panel/common/intl';
import { getLogoutUrl } from 'panel/api/generated';
import { AccordionSection } from './AccordionSection';

import s from './styles.module.pcss';

type Props = {
    accountSubMenu: boolean;
    setAccountSubMenu: (value: boolean) => void;
    burgerMenuId?: string;
    closeSubMenu?: () => void;
    rightSideDropdown?: boolean;
    headerMenu?: boolean;
};

export const Menu = (props: Props) => {
    const location = useLocation();
    const primaryNavigation: Array<{ label: string; route: RoutePathKey; icon: IconType }> = [
        {
            label: intl.getMessage('cyguard_nav_dashboard'),
            route: RoutePath.Dashboard,
            icon: 'dashboard',
        },
        {
            label: intl.getMessage('cyguard_nav_scan'),
            route: RoutePath.ScanCenter,
            icon: 'search',
        },
        {
            label: intl.getMessage('cyguard_nav_network'),
            route: RoutePath.NetworkActivity,
            icon: 'log',
        },
        {
            label: intl.getMessage('cyguard_nav_threats'),
            route: RoutePath.ThreatProtection,
            icon: 'adblocking',
        },
        {
            label: intl.getMessage('cyguard_nav_devices'),
            route: RoutePath.Devices,
            icon: 'connections',
        },
        {
            label: intl.getMessage('cyguard_nav_privacy'),
            route: RoutePath.Privacy,
            icon: 'lock',
        },
        {
            label: intl.getMessage('cyguard_nav_reports'),
            route: RoutePath.Reports,
            icon: 'recent',
        },
        {
            label: intl.getMessage('cyguard_nav_flagged'),
            route: RoutePath.FlaggedSites,
            icon: 'tune',
        },
    ];

    const isActive = (path: string | string[], full = false) => {
        const paths = Array.isArray(path) ? path : [path];
        return paths.some((p) => location.pathname === p || (!full && location.pathname.startsWith(`${p}/`)));
    };

    return (
        <div class={cn(s.menuWrapper, { [s.headerMenu]: props.headerMenu })}>
            <nav
                class={s.topMenuWrapper}
                aria-label={intl.getMessage('cyguard_nav_accessibility')}
            >
                <div class={s.sectionLabel}>{intl.getMessage('cyguard_nav_security_console')}</div>
                <For each={primaryNavigation}>
                    {(item) => (
                        <div class={s.menuLinkWrapper}>
                            <Link
                                class={cn(s.menuLink, { [s.activeLink]: isActive(Paths[item.route], true) })}
                                to={item.route}
                            >
                                <Icon class={s.linkIcon} icon={item.icon} />
                                <span class={theme.common.textOverflow}>{item.label}</span>
                            </Link>
                        </div>
                    )}
                </For>
                <div class={s.sectionLabel}>{intl.getMessage('cyguard_nav_system')}</div>
                <AccordionSection
                    title={intl.getMessage('cyguard_nav_settings')}
                    icon="settings"
                    items={[
                        { label: intl.getMessage('settings_general_short'), path: Paths.SettingsPage, routePath: RoutePath.SettingsPage },
                        { label: 'DNS', path: Paths.Dns, routePath: RoutePath.Dns },
                        { label: intl.getMessage('protocols'), path: Paths.Encryption, routePath: RoutePath.Encryption },
                        { label: intl.getMessage('allowlists'), path: Paths.DnsAllowlists, routePath: RoutePath.DnsAllowlists },
                        { label: intl.getMessage('dns_rewrites'), path: Paths.DnsRewrites, routePath: RoutePath.DnsRewrites },
                        { label: intl.getMessage('blocked_services'), path: Paths.BlockedServices, routePath: RoutePath.BlockedServices },
                        { label: 'DHCP', path: Paths.Dhcp, routePath: RoutePath.Dhcp },
                    ]}
                    isActive={isActive}
                />
                <div class={s.menuLinkWrapper}>
                    <Link
                        class={cn(s.menuLink, {
                            [s.activeLink]: isActive(Paths.Diagnostics, true),
                        })}
                        to={RoutePath.Diagnostics}
                    >
                        <Icon class={s.linkIcon} icon="faq" />
                        <span class={theme.common.textOverflow}>
                            {intl.getMessage('cyguard_nav_diagnostics')}
                        </span>
                    </Link>
                </div>
            </nav>
            <div class={s.referenceWrapper}>
                <div class={s.productMeta}>
                    <strong>{intl.getMessage('cyguard_product_meta')}</strong>
                    <span>{intl.getMessage('cyguard_product_tagline')}</span>
                </div>
                <div class={s.menuLinkWrapper}>
                    <a href={getLogoutUrl()} target="_blank" rel="noopener noreferrer" class={s.menuLink} id="sign_out">
                        <Icon class={s.linkIcon} icon="logout" />
                        <span class={theme.common.textOverflow}>{intl.getMessage('logout')}</span>
                    </a>
                </div>
            </div>
        </div>
    );
};
