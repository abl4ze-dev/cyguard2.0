import s from './styles.module.pcss';
import intl from 'panel/common/intl';

type Props = {
    id: string;
};

/** CYGUARD C/G shield and wordmark.  Keep the mark geometry aligned with the PWA assets. */
export const Logo = (props: Props) => {
    const gradientId = () => `cyguard_gradient_${props.id || 'brand'}`;

    return (
        <svg
            width="184"
            height="40"
            viewBox="0 0 184 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class={s.logo}
            role="img"
            aria-label={intl.getMessage('cyguard_logo_label')}
        >
            <path
                d="M20 2.5 34 7.7v10.2c0 9.2-5.6 16.2-14 19.6C11.6 34.1 6 27.1 6 17.9V7.7L20 2.5Z"
                fill={`url(#${gradientId()})`}
            />
            <path
                d="M25.9 12.2A9.1 9.1 0 1 0 27.6 25h-7.1v-4.1h11.2v7.2c-2.8 3.8-7 5.9-11.7 5.9a14 14 0 0 1 0-28c3.8 0 7.4 1.5 10 4.1l-4.1 2.1Z"
                fill="#05070B"
            />
            <path d="M20.5 14.1a6 6 0 1 0 0 11.8h4.9v-3.2h-4.6a2.8 2.8 0 1 1 0-5.5h7v-3.1h-7.3Z" fill="#F8FAFC" />
            <text
                x="45"
                y="26.5"
                class={s.logoWordmark}
                font-family="Inter, Segoe UI, Arial, sans-serif"
                font-size="20"
                font-weight="750"
                letter-spacing="2.1"
            >
                CYGUARD
            </text>
            <defs>
                <linearGradient id={gradientId()} x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#38BDF8" />
                    <stop offset="0.52" stop-color="#1677FF" />
                    <stop offset="1" stop-color="#22D3EE" />
                </linearGradient>
            </defs>
        </svg>
    );
};
