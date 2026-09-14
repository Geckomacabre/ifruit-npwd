import { config } from '@npwd/config/server';
import {
  TRENDY_CAPTION_MAX,
  TRENDY_POST_COOLDOWN_MS,
  TrendyCreateDTO,
  TrendyError,
  TrendyIdDTO,
  TrendyLikeResult,
  TrendyPost,
} from '@typings/trendy';
import PlayerService from '../players/player.service';
import { PromiseEventResp, PromiseRequest } from '../lib/PromiseNetEvents/promise.types';
import { TrendyDB, TrendyRow, _TrendyDB } from './trendy.database';

const FEED_LIMIT = 60;
const VIDEO_EXT = ['.mp4', '.webm', '.mov'];

const cleanText = (value: unknown, max: number): string =>
  String(value ?? '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);

// Same allow-list the rest of the phone uses for media.
const isAllowedMedia = (value: string): boolean => {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      config.imageSafety.safeImageUrls.some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
      )
    );
  } catch (e) {
    return false;
  }
};

const looksLikeVideo = (value: string): boolean => {
  try {
    const path = new URL(value).pathname.toLowerCase();
    return VIDEO_EXT.some((ext) => path.endsWith(ext));
  } catch (e) {
    return false;
  }
};

const toPost = (row: TrendyRow, viewer: string): TrendyPost => ({
  id: row.id,
  media: row.media,
  isVideo: looksLikeVideo(row.media),
  caption: row.caption,
  authorName: row.author_name,
  mine: row.identifier === viewer,
  likes: Number(row.likes),
  liked: Number(row.liked) > 0,
  createdAt: Number(row.createdAt),
});

class _TrendyService {
  private readonly db: _TrendyDB;
  private readonly lastPostAt = new Map<string, number>();

  constructor() {
    this.db = TrendyDB;
  }

  async handleFetch(reqObj: PromiseRequest<void>, resp: PromiseEventResp<TrendyPost[]>) {
    const viewer = PlayerService.getIdentifier(reqObj.source);
    const rows = await this.db.fetchFeed(viewer, FEED_LIMIT);
    resp({ status: 'ok', data: rows.map((row) => toPost(row, viewer)) });
  }

  async handleCreate(reqObj: PromiseRequest<TrendyCreateDTO>, resp: PromiseEventResp<TrendyPost>) {
    const fail = (errorMsg: TrendyError) => resp({ status: 'error', errorMsg });
    const player = PlayerService.getPlayer(reqObj.source);
    const identifier = player.getIdentifier();

    if (Date.now() - (this.lastPostAt.get(identifier) ?? 0) < TRENDY_POST_COOLDOWN_MS) {
      return fail('TOO_SOON');
    }

    const media = cleanText(reqObj.data?.media, 500);
    const caption = cleanText(reqObj.data?.caption, TRENDY_CAPTION_MAX);
    if (!media || !isAllowedMedia(media)) return fail('INVALID_MEDIA');

    const authorName = `${player.getFirstName()} ${player.getLastName()}`.trim();
    const id = await this.db.createPost(identifier, authorName, media, caption);
    this.lastPostAt.set(identifier, Date.now());

    const row = await this.db.fetchOne(identifier, id);
    if (!row) return fail('GENERIC_DB_ERROR');
    resp({ status: 'ok', data: toPost(row, identifier) });
  }

  async handleDelete(reqObj: PromiseRequest<TrendyIdDTO>, resp: PromiseEventResp<void>) {
    const identifier = PlayerService.getIdentifier(reqObj.source);
    const id = Number(reqObj.data?.id);
    if (!Number.isFinite(id)) return resp({ status: 'error', errorMsg: 'NOT_FOUND' });

    const deleted = await this.db.deletePost(id, identifier);
    if (!deleted) return resp({ status: 'error', errorMsg: 'NOT_FOUND' });
    resp({ status: 'ok' });
  }

  async handleToggleLike(reqObj: PromiseRequest<TrendyIdDTO>, resp: PromiseEventResp<TrendyLikeResult>) {
    const identifier = PlayerService.getIdentifier(reqObj.source);
    const id = Number(reqObj.data?.id);

    if (!Number.isFinite(id) || !(await this.db.postExists(id))) {
      return resp({ status: 'error', errorMsg: 'NOT_FOUND' });
    }

    const liked = await this.db.toggleLike(id, identifier);
    resp({ status: 'ok', data: { id, liked, likes: await this.db.countLikes(id) } });
  }
}

const TrendyService = new _TrendyService();
export default TrendyService;
