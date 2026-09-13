import { Link } from 'panel/common/ui/Link';
import { Icon } from 'panel/common/ui/Icon';
import intl from 'panel/common/intl';
import { RoutePath } from 'panel/components/Routes/Paths';
import { dashboardState } from 'panel/stores/dashboard';
import theme from 'panel/lib/theme';

import s from './Diagnostics.module.pcss';

export const Diagnostics = () => (
    <main class={theme.layout.container}>
        <div class={theme.layout.containerIn}>
            <header class={s.header}>
                <span class={s.eyebrow}>{intl.getMessage('cyguard_diagnostics_operations')}</span>
                <h1>{intl.getMessage('cyguard_diagnostics_title')}</h1>
                <p>{intl.getMessage('cyguard_diagnostics_subtitle')}</p>
            </header>

            <section
                class={s.statusGrid}
                aria-label={intl.getMessage('cyguard_status_system')}
            >
                <article class={s.statusCard}>
                    <span>{intl.getMessage('cyguard_diagnostics_core')}</span>
                    <strong class={dashboardState.isCoreRunning ? s.ok : s.error}>
                        {dashboardState.isCoreRunning
                            ? intl.getMessage('cyguard_status_online')
                            : intl.getMessage('cyguard_status_offline')}
                    </strong>
                </article>
                <article class={s.statusCard}>
                    <span>{intl.getMessage('cyguard_diagnostics_dns')}</span>
                    <strong class={dashboardState.protectionEnabled ? s.ok : s.warning}>
                        {dashboardState.protectionEnabled
                            ? intl.getMessage('cyguard_status_active')
                            : intl.getMessage('cyguard_status_inactive')}
                    </strong>
                </article>
                <article class={s.statusCard}>
                    <span>{intl.getMessage('cyguard_diagnostics_listeners')}</span>
                    <strong>
                        {dashboardState.dnsAddresses.length ||
                            intl.getMessage('cyguard_status_data_unavailable')}
                    </strong>
                </article>
                <article class={s.statusCard}>
                    <span>{intl.getMessage('cyguard_diagnostics_engine')}</span>
                    <strong>
                        {dashboardState.dnsVersion ||
                            intl.getMessage('cyguard_status_data_unavailable')}
                    </strong>
                </article>
            </section>

            <section
                class={s.resources}
                aria-label={intl.getMessage('cyguard_diagnostics_tools')}
            >
                <Link to={RoutePath.NetworkActivity} class={s.resourceCard}>
                    <Icon icon="log" />
                    <div>
                        <strong>{intl.getMessage('cyguard_nav_network')}</strong>
                        <p>{intl.getMessage('cyguard_network_activity_desc')}</p>
                    </div>
                </Link>
                <Link to={RoutePath.Dns} class={s.resourceCard}>
                    <Icon icon="settings" />
                    <div>
                        <strong>{intl.getMessage('cyguard_dns_configuration')}</strong>
                        <p>{intl.getMessage('cyguard_dns_configuration_desc')}</p>
                    </div>
                </Link>
                <Link to={RoutePath.Guide} class={s.resourceCard}>
                    <Icon icon="faq" />
                    <div>
                        <strong>{intl.getMessage('cyguard_setup_guidance')}</strong>
                        <p>{intl.getMessage('cyguard_setup_guidance_desc')}</p>
                    </div>
                </Link>
            </section>
        </div>
    </main>
);
