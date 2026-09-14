import { ResultSetHeader } from 'mysql2';
import { DbInterface } from '@npwd/database';

export interface InstaPicRow {
  id: number;
  identifier: string;
  author_name: string;
  image: string;
  caption: string;
  likes: number;
  liked: number;
  createdAt: number;
}

// Likes live in their own table rather than a counter column so a player can
// only ever like a post once, enforced by the primary key instead of by hoping
// the UI behaves.
export class _InstaPicDB {
  async ensureTables(): Promise<void> {
    await DbInterface._rawExec(`
      CREATE TABLE IF NOT EXISTS npwd_instapic_posts
      (
          id          int(11)      NOT NULL AUTO_INCREMENT,
          identifier  varchar(48)  NOT NULL COLLATE 'utf8mb4_general_ci',
          author_name varchar(100) NOT NULL,
          image       varchar(500) NOT NULL,
          caption     varchar(300) NOT NULL DEFAULT '',
          createdAt   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX identifier (identifier)
      )`);

    await DbInterface._rawExec(`
      CREATE TABLE IF NOT EXISTS npwd_instapic_likes
      (
          post_id    int(11)     NOT NULL,
          identifier varchar(48) NOT NULL COLLATE 'utf8mb4_general_ci',
          PRIMARY KEY (post_id, identifier),
          INDEX post_id (post_id)
      )`);
  }

  private selectPosts(where: string): string {
    return `
      SELECT p.id, p.identifier, p.author_name, p.image, p.caption,
             CAST(UNIX_TIMESTAMP(p.createdAt) AS UNSIGNED) * 1000 AS createdAt,
             (SELECT COUNT(*) FROM npwd_instapic_likes l WHERE l.post_id = p.id) AS likes,
             (SELECT COUNT(*) FROM npwd_instapic_likes l WHERE l.post_id = p.id AND l.identifier = ?) AS liked
      FROM npwd_instapic_posts p
      ${where}
      ORDER BY p.id DESC
      LIMIT ?`;
  }

  async fetchFeed(viewer: string, limit: number): Promise<InstaPicRow[]> {
    const [rows] = await DbInterface._rawExec(this.selectPosts(''), [viewer, limit]);
    return rows as InstaPicRow[];
  }

  async fetchByAuthor(viewer: string, identifier: string, limit: number): Promise<InstaPicRow[]> {
    const [rows] = await DbInterface._rawExec(this.selectPosts('WHERE p.identifier = ?'), [
      viewer,
      identifier,
      limit,
    ]);
    return rows as InstaPicRow[];
  }

  async fetchOne(viewer: string, id: number): Promise<InstaPicRow | null> {
    const [rows] = await DbInterface._rawExec(this.selectPosts('WHERE p.id = ?'), [viewer, id, 1]);
    return (rows as InstaPicRow[])[0] ?? null;
  }

  async createPost(
    identifier: string,
    authorName: string,
    image: string,
    caption: string,
  ): Promise<number> {
    const [result] = await DbInterface._rawExec(
      `INSERT INTO npwd_instapic_posts (identifier, author_name, image, caption)
       VALUES (?, ?, ?, ?)`,
      [identifier, authorName, image, caption],
    );
    return (result as ResultSetHeader).insertId;
  }

  /** Only deletes when the caller owns the row, so ownership is checked in SQL. */
  async deletePost(id: number, identifier: string): Promise<boolean> {
    const [result] = await DbInterface._rawExec(
      `DELETE FROM npwd_instapic_posts WHERE id = ? AND identifier = ?`,
      [id, identifier],
    );
    const deleted = (result as ResultSetHeader).affectedRows > 0;
    if (deleted) {
      await DbInterface._rawExec(`DELETE FROM npwd_instapic_likes WHERE post_id = ?`, [id]);
    }
    return deleted;
  }

  async postExists(id: number): Promise<boolean> {
    const [rows] = await DbInterface._rawExec(`SELECT id FROM npwd_instapic_posts WHERE id = ?`, [id]);
    return (rows as unknown[]).length > 0;
  }

  /** Returns whether the post is liked after the toggle. */
  async toggleLike(id: number, identifier: string): Promise<boolean> {
    const [result] = await DbInterface._rawExec(
      `DELETE FROM npwd_instapic_likes WHERE post_id = ? AND identifier = ?`,
      [id, identifier],
    );

    if ((result as ResultSetHeader).affectedRows > 0) return false;

    await DbInterface._rawExec(
      `INSERT IGNORE INTO npwd_instapic_likes (post_id, identifier) VALUES (?, ?)`,
      [id, identifier],
    );
    return true;
  }

  async countLikes(id: number): Promise<number> {
    const [rows] = await DbInterface._rawExec(
      `SELECT COUNT(*) AS likes FROM npwd_instapic_likes WHERE post_id = ?`,
      [id],
    );
    return Number((rows as { likes: number }[])[0]?.likes ?? 0);
  }
}

export const InstaPicDB = new _InstaPicDB();
