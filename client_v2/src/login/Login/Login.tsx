import intl from 'panel/common/intl';
import { PublicHeader } from 'panel/common/ui/PublicHeader';
import { Icons } from 'panel/common/ui/Icons';

import s from 'panel/common/ui/Header/Header.module.pcss';
import { processLogin } from 'panel/stores/login';
import { Toasts } from 'panel/components/Toasts';
import { Form, type LoginFormValues } from './Form';
import styles from './styles.module.pcss';

export const Login = () => {
    const handleSubmit = (values: LoginFormValues) => {
        processLogin({ name: values.username, password: values.password });
    };

    return (
        <div class={styles.loginWrapper}>
            <PublicHeader
                dropdownClass={s.dropdown}
                dropdownPosition="bottomRight"
                useLocalLanguage={true}
            />
            <div class={styles.login}>
                <span class={styles.eyebrow}>{intl.getMessage('cyguard_login_eyebrow')}</span>
                <h1 class={styles.title}>{intl.getMessage('cyguard_login_title')}</h1>
                <p class={styles.subtitle}>{intl.getMessage('cyguard_login_subtitle')}</p>
                <Form onSubmit={handleSubmit} />
            </div>

            <Toasts />

            <Icons />
        </div>
    );
};
