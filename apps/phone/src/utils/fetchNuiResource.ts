import { isEnvBrowser } from './misc';

/**
 * fetchNui for a callback registered by a DIFFERENT resource.
 *
 * The normal fetchNui always posts to NPWD's own resource. That is right for
 * apps whose Lua lives in npwd/lua, but not for a bridge that has to stay
 * where its data is: sk_streetkings' phone app reads globals defined inside
 * that resource (SKRaceEvents, SKNpcInvite), so moving the bridge into npwd
 * would leave them undefined. NUI callbacks are addressed by resource, so the
 * UI can simply call across.
 */
async function fetchNuiResource<T = unknown, D = unknown>(
  resource: string,
  eventName: string,
  data?: D,
  mockResp?: T,
): Promise<T> {
  if (isEnvBrowser() && mockResp !== undefined) return mockResp;

  const resp = await fetch(`https://${resource}/${eventName}`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data ?? {}),
  });

  return resp.json();
}

export default fetchNuiResource;
