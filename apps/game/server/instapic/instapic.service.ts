import { config } from '@npwd/config/server';
import {
  INSTAPIC_CAPTION_MAX,
  INSTAPIC_POST_COOLDOWN_MS,
  InstaPicCreateDTO,
  InstaPicError,
  InstaPicIdDTO,
  InstaPicLikeResult,
  InstaPicPost,
} from '@typings/instapic';
import PlayerService from '../players/player.service';
import { PromiseEventResp, PromiseRequest } from '../lib/PromiseNetEvents/promise.types';
import { InstaPicDB, InstaPicRow, _InstaPicDB } from './instapic.database';
import { instapicLogger } from './instapic.utils';

const FEED_LIMIT = 100;

const cleanText = (value: unknown, max: number): string =>
  String(value ?? '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);

// Same allow-list the rest of the phone uses for pictures.
const isAllowedImage = (value: string): boolean => {
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

const toPost = (row: InstaPicRow, viewer: string): InstaPicPost => ({
  id: row.id,
  image: row.image,
  caption: row.caption,
  authorName: row.author_name,
  mine: row.identifier === viewer,
  likes: Number(row.likes),
  liked: Number(row.liked) > 0,
  createdAt: Number(row.createdAt),
});

class _InstaPicService {
  private readonly db: _InstaPicDB;
  private readonly lastPostAt = new Map<string, number>();

  constructor() {
    this.db = InstaPicDB;
  }

  async handleFetch(reqObj: PromiseRequest<void>, resp: PromiseEventResp<InstaPicPost[]>) {
    const viewer = PlayerService.getIdentifier(reqObj.source);
    const rows = await this.db.fetchFeed(viewer, FEED_LIMIT);
    resp({ status: 'ok', data: rows.map((row) => toPost(row, viewer)) });
  }

  async handleFetchMine(reqObj: PromiseRequest<void>, resp: PromiseEventResp<InstaPicPost[]>) {
    const viewer = PlayerService.getIdentifier(reqObj.source);
    const rows = await this.db.fetchByAuthor(viewer, viewer, FEED_LIMIT);
    resp({ status: 'ok', data: rows.map((row) => toPost(row, viewer)) });
  }

  async handleCreate(reqObj: PromiseRequest<InstaPicCreateDTO>, resp: PromiseEventResp<InstaPicPost>) {
    const fail = (errorMsg: InstaPicError) => resp({ status: 'error', errorMsg });
    const player = PlayerService.getPlayer(reqObj.source);
    const identifier = player.getIdentifier();

    const lastPost = this.lastPostAt.get(identifier) ?? 0;
    if (Date.now() - lastPost < INSTAPIC_POST_COOLDOWN_MS) return fail('TOO_SOON');

    const image = cleanText(reqObj.data?.image, 500);
    const caption = cleanText(reqObj.data?.caption, INSTAPIC_CAPTION_MAX);

    if (!image || !isAllowedImage(image)) return fail('INVALID_IMAGE');

    const authorName = `${player.getFirstName()} ${player.getLastName()}`.trim();
    const id = await this.db.createPost(identifier, authorName, image, caption);
    this.lastPostAt.set(identifier, Date.now());

    const row = await this.db.fetchOne(identifier, id);
    if (!row) return fail('GENERIC_DB_ERROR');

    resp({ status: 'ok', data: toPost(row, identifier) });
  }

  async handleDelete(reqObj: PromiseRequest<InstaPicIdDTO>, resp: PromiseEventResp<void>) {
    const identifier = PlayerService.getIdentifier(reqObj.source);
    const id = Number(reqObj.data?.id);

    if (!Number.isFinite(id)) return resp({ status: 'error', errorMsg: 'NOT_FOUND' });

    // Ownership is enforced by the DELETE's WHERE clause, not by a prior read.
    const deleted = await this.db.deletePost(id, identifier);
    if (!deleted) return resp({ status: 'error', errorMsg: 'NOT_FOUND' });

    resp({ status: 'ok' });
  }

  async handleToggleLike(
    reqObj: PromiseRequest<InstaPicIdDTO>,
    resp: PromiseEventResp<InstaPicLikeResult>,
  ) {
    const identifier = PlayerService.getIdentifier(reqObj.source);
    const id = Number(reqObj.data?.id);

    if (!Number.isFinite(id) || !(await this.db.postExists(id))) {
      return resp({ status: 'error', errorMsg: 'NOT_FOUND' });
    }

    const liked = await this.db.toggleLike(id, identifier);
    resp({ status: 'ok', data: { id, liked, likes: await this.db.countLikes(id) } });
  }
}

const InstaPicService = new _InstaPicService();
export default InstaPicService;
