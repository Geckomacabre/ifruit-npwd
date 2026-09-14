import { ResultSetHeader } from 'mysql2';
import { DbInterface } from '@npwd/database';

export interface TrendyRow {
  id: number;
  identifier: string;
  author_name: string;
  media: string;
  caption: string;
  likes: number;
  liked: number;
  createdAt: number;
}

export class _TrendyDB {
  async ensureTables(): Promise<void> {
    await DbInterface._rawExec(`
      CREATE TABLE IF NOT EXISTS npwd_trendy_posts
      (
          id          int(11)      NOT NULL AUTO_INCREMENT,
          identifier  varchar(48)  NOT NULL COLLATE 'utf8mb4_general_ci',
          author_name varchar(100) NOT NULL,
          media       varchar(500) NOT NULL,
          caption     varchar(200) NOT NULL DEFAULT '',
          createdAt   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX identifier (identifier)
      )`);

    await DbInterface._rawExec(`
      CREATE TABLE IF NOT EXISTS npwd_trendy_likes
      (
          post_id    int(11)     NOT NULL,
          identifier varchar(48) NOT NULL COLLATE 'utf8mb4_general_ci',
          PRIMARY KEY (post_id, identifier),
          INDEX post_id (post_id)
      )`);
  }

  private select(where: string): string {
    return `
      SELECT p.id, p.identifier, p.author_name, p.media, p.caption,
             CAST(UNIX_TIMESTAMP(p.createdAt) AS UNSIGNED) * 1000 AS createdAt,
             (SELECT COUNT(*) FROM npwd_trendy_likes l WHERE l.post_id = p.id) AS likes,
             (SELECT COUNT(*) FROM npwd_trendy_likes l WHERE l.post_id = p.id AND l.identifier = ?) AS liked
      FROM npwd_trendy_posts p
      ${where}
      ORDER BY p.id DESC
      LIMIT ?`;
  }

  async fetchFeed(viewer: string, limit: number): Promise<TrendyRow[]> {
    const [rows] = await DbInterface._rawExec(this.select(''), [viewer, limit]);
    return rows as TrendyRow[];
  }

  async fetchOne(viewer: string, id: number): Promise<TrendyRow | null> {
    const [rows] = await DbInterface._rawExec(this.select('WHERE p.id = ?'), [viewer, id, 1]);
    return (rows as TrendyRow[])[0] ?? null;
  }

  async createPost(identifier: string, authorName: string, media: string, caption: string): Promise<number> {
    const [result] = await DbInterface._rawExec(
      `INSERT INTO npwd_trendy_posts (identifier, author_name, media, caption) VALUES (?, ?, ?, ?)`,
      [identifier, authorName, media, caption],
    );
    return (result as ResultSetHeader).insertId;
  }

  /** Ownership is enforced here rather than by a prior read. */
  async deletePost(id: number, identifier: string): Promise<boolean> {
    const [result] = await DbInterface._rawExec(
      `DELETE FROM npwd_trendy_posts WHERE id = ? AND identifier = ?`,
      [id, identifier],
    );
    const deleted = (result as ResultSetHeader).affectedRows > 0;
    if (deleted) await DbInterface._rawExec(`DELETE FROM npwd_trendy_likes WHERE post_id = ?`, [id]);
    return deleted;
  }

  async postExists(id: number): Promise<boolean> {
    const [rows] = await DbInterface._rawExec(`SELECT id FROM npwd_trendy_posts WHERE id = ?`, [id]);
    return (rows as unknown[]).length > 0;
  }

  async toggleLike(id: number, identifier: string): Promise<boolean> {
    const [result] = await DbInterface._rawExec(
      `DELETE FROM npwd_trendy_likes WHERE post_id = ? AND identifier = ?`,
      [id, identifier],
    );
    if ((result as ResultSetHeader).affectedRows > 0) return false;

    await DbInterface._rawExec(
      `INSERT IGNORE INTO npwd_trendy_likes (post_id, identifier) VALUES (?, ?)`,
      [id, identifier],
    );
    return true;
  }

  async countLikes(id: number): Promise<number> {
    const [rows] = await DbInterface._rawExec(
      `SELECT COUNT(*) AS likes FROM npwd_trendy_likes WHERE post_id = ?`,
      [id],
    );
    return Number((rows as { likes: number }[])[0]?.likes ?? 0);
  }
}

export const TrendyDB = new _TrendyDB();
