import { MailAction } from '@typings/mail';
import { mainLogger } from '../sv_logger';

export const mailLogger = mainLogger.child({ module: 'mail' });

const MAX_ACTIONS = 3;

// Mail from other resources is often qb-phone-era HTML (<br>, <b>...). It is
// flattened to plain text with its line breaks kept, so nothing a sender writes
// can render as markup in the phone.
export const toPlainText = (value: unknown, max: number): string =>
  String(value ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
    .slice(0, max);

/**
 * Accepts both lb-phone's shape ({ label, data = { event, isServer, data } })
 * and a flat one ({ label, event, isServer, data }). Server-side actions are
 * only kept when the mail came from trusted server code.
 */
export const normalizeActions = (raw: unknown, allowServer: boolean): MailAction[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .slice(0, MAX_ACTIONS)
    .map((entry: any): MailAction | null => {
      const inner = entry?.data && typeof entry.data === 'object' && 'event' in entry.data ? entry.data : entry;
      if (typeof inner?.event !== 'string' || !inner.event) return null;

      return {
        label: toPlainText(entry.label ?? 'Open', 30) || 'Open',
        event: inner.event,
        isServer: allowServer && inner.isServer === true,
        data: inner.data ?? null,
      };
    })
    .filter((action): action is MailAction => action !== null);
};
