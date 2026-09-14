import {IApp} from '@os/apps/config/apps';
import {SnackbarContent, CustomContentProps} from 'notistack';
import React, {forwardRef} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {useNotification} from '../useNotification';
import {cn} from "@npwd/keyos";

interface NotificationBaseProps extends CustomContentProps {
    app: IApp;
    secondaryTitle?: string;
    path?: string;
    onClick?: () => void;
}

export type NotificationBaseComponent = React.FC<NotificationBaseProps>;

const NotificationBase = forwardRef<HTMLDivElement, NotificationBaseProps>((props, ref) => {
    const {markAsRead} = useNotification();
    const {app, message, secondaryTitle, path, onClick} = props;
    const [t] = useTranslation();
    const history = useHistory();

    const handleNotisClick = () => {
        path && !onClick ? history.push(path) : onClick();
        markAsRead(props.id.toString());
    };

    if (!app) {
        console.error('App was not found. Could not render notification.');
        console.error(
            'If you are using an external app, make sure it is started before NPWD and that you pass the correct app id to the notification.',
        );
        return null;
    }

    if (!app.NotificationIcon) {
        console.warn('App does not have a notification icon');
    }

    // No fixed min-width and a column layout: the phone screen is 400px wide,
    // so a 370px floor plus the container's own padding overflowed it, and the
    // row layout put the message beside the title instead of under it -- which
    // together made an arriving banner swallow the whole screen.
    return (
        <SnackbarContent
            onClick={handleNotisClick}
            ref={ref}
            className="liquid-glass flex w-full flex-col rounded-[22px] px-3.5 py-3"
        >
            <div className="mb-1 flex w-full items-center gap-2 text-neutral-900 dark:text-neutral-50">
                {app.Icon ? (
                    <app.Icon className="h-7 w-7 shrink-0 rounded-lg"/>
                ) : (
                    <div
                        className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full")}
                        style={{backgroundColor: app.backgroundColor}}
                    >
                        {app.NotificationIcon && <app.NotificationIcon fontSize="inherit"/>}
                    </div>
                )}
                <div className="grow truncate text-sm font-semibold">
                    {t(app.nameLocale)}
                </div>
                {secondaryTitle && (
                    <p className="shrink-0 text-xs text-neutral-600 dark:text-neutral-300">{secondaryTitle}</p>
                )}
            </div>
            <div className="line-clamp-2 overflow-hidden text-sm text-neutral-900 dark:text-neutral-50">
                <p>{message}</p>
            </div>
        </SnackbarContent>
    );
});

export default NotificationBase;