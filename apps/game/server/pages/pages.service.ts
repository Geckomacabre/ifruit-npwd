import { config } from '@npwd/config/server';
import {
  PAGES_DESCRIPTION_MAX,
  PAGES_POST_COOLDOWN_MS,
  PAGES_PRICE_MAX,
  PAGES_TITLE_MAX,
  PagesCreateDTO,
  PagesError,
  PagesIdDTO,
  PagesPost,
} from '@typings/pages';
import PlayerService from '../players/player.service';
import { PromiseEventResp, PromiseRequest } from '../lib/PromiseNetEvents/promise.types';
import { PagesDB, PagesRow, _PagesDB } from './pages.database';
import { pagesLogger } from './pages.utils';

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
      config.imageSafety.safeImageUrls.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
    );
  } catch (e) {
    return false;
  }
};

const toPost = (row: PagesRow, viewerIdentifier: string): PagesPost => ({
  id: row.id,
  title: row.title,
  description: row.description,
  image: row.image,
  price: row.price === null ? null : Number(row.price),
  phoneNumber: row.phone_number,
  authorName: row.author_name,
  mine: row.identifier === viewerIdentifier,
  createdAt: Number(row.createdAt),
});

class _PagesService {
  private readonly pagesDB: _PagesDB;
  private readonly lastPostAt = new Map<string, number>();

  constructor() {
    this.pagesDB = PagesDB;
    pagesLogger.debug('Pages service started');
  }

  async handleFetch(reqObj: PromiseRequest<void>, resp: PromiseEventResp<PagesPost[]>) {
    try {
      const identifier = PlayerService.getIdentifier(reqObj.source);
      const rows = await this.pagesDB.fetchPosts(FEED_LIMIT);
      resp({ status: 'ok', data: rows.map((row) => toPost(row, identifier)) });
    } catch (e) {
      pagesLogger.error(`Error in handleFetch, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  async handleCreate(reqObj: PromiseRequest<PagesCreateDTO>, resp: PromiseEventResp<PagesPost>) {
    const fail = (errorMsg: PagesError) => resp({ status: 'error', errorMsg });
    const player = PlayerService.getPlayer(reqObj.source);
    const identifier = player.getIdentifier();

    const lastPost = this.lastPostAt.get(identifier) ?? 0;
    if (Date.now() - lastPost < PAGES_POST_COOLDOWN_MS) return fail('TOO_SOON');

    const title = cleanText(reqObj.data?.title, PAGES_TITLE_MAX);
    const description = cleanText(reqObj.data?.description, PAGES_DESCRIPTION_MAX);
    const imageInput = cleanText(reqObj.data?.image, 500);
    const rawPrice = reqObj.data?.price;

    if (title.length < 3) return fail('INVALID_TITLE');
    if (!description) return fail('INVALID_DESCRIPTION');
    if (imageInput && !isAllowedImage(imageInput)) return fail('INVALID_IMAGE');

    let price: number | null = null;
    if (rawPrice !== null && rawPrice !== undefined && String(rawPrice) !== '') {
      price = Math.floor(Number(rawPrice));
      if (!Number.isFinite(price) || price < 0 || price > PAGES_PRICE_MAX) return fail('INVALID_PRICE');
    }

    try {
      const row: Omit<PagesRow, 'id' | 'createdAt'> = {
        identifier,
        author_name: player.getName() ?? player.getPhoneNumber(),
        phone_number: player.getPhoneNumber(),
        title,
        description,
        image: imageInput || null,
        price,
      };
      const id = await this.pagesDB.addPost(row);
      this.lastPostAt.set(identifier, Date.now());

      resp({ status: 'ok', data: toPost({ ...row, id, createdAt: Date.now() }, identifier) });
    } catch (e) {
      pagesLogger.error(`Error in handleCreate, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  async handleDelete(reqObj: PromiseRequest<PagesIdDTO>, resp: PromiseEventResp<void>) {
    try {
      const deleted = await this.pagesDB.deletePost(
        Number(reqObj.data?.id),
        PlayerService.getIdentifier(reqObj.source),
      );
      resp(deleted ? { status: 'ok' } : { status: 'error', errorMsg: 'NOT_FOUND' });
    } catch (e) {
      pagesLogger.error(`Error in handleDelete, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }
}

const PagesService = new _PagesService();
export default PagesService;
