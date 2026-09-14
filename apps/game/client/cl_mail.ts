import { MailAction, MailEvents, MailMessage } from '@typings/mail';
import { NotificationEvents } from '@typings/notifications';
import { RegisterNuiCB, RegisterNuiProxy } from './cl_utils';
import { sendMessage } from '../utils/messages';

RegisterNuiProxy(MailEvents.FETCH_MAILBOX);
RegisterNuiProxy(MailEvents.SEND);
RegisterNuiProxy(MailEvents.MARK_READ);
RegisterNuiProxy(MailEvents.DELETE);

// A tapped mail button. qb-phone passed buttonData straight to the event, so
// the data goes through unwrapped.
RegisterNuiCB<MailAction>(MailEvents.RUN_ACTION, (action, cb) => {
  if (action && typeof action.event === 'string' && action.event) {
    if (action.isServer) emitNet(action.event, action.data);
    else emit(action.event, action.data);
  }
  cb({});
});

onNet(MailEvents.NEW_MAIL, (message: MailMessage) => {
  sendMessage('EMAIL', MailEvents.NEW_MAIL, message);

  sendMessage('PHONE', NotificationEvents.CREATE_NOTIFICATION, {
    appId: 'EMAIL',
    notisId: `npwd:mail:${message.id}`,
    secondaryTitle: message.senderName,
    content: message.subject,
    keepOpen: false,
    duration: 3000,
    path: `/mail/${message.id}`,
  });
});
