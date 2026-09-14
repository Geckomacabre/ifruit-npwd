import { ResultSetHeader } from 'mysql2';
import { DbInterface } from '@npwd/database';

export interface PagesRow {
  id: number;
  identifier: string;
  author_name: string;
  phone_number: string;
  title: string;
  description: string;
  image: string | null;
  price: number | null;
  createdAt: number;
}

export class _PagesDB {
  // Also in import.sql; created here so an existing server needs no manual import.
  async ensureTable(): Promise<void> {
    await DbInterface._rawExec(`
      CREATE TABLE IF NOT EXISTS npwd_pages_posts
      (
          id           int(11)       NOT NULL AUTO_INCREMENT,
          identifier   varchar(48)   NOT NULL COLLATE 'utf8mb4_general_ci',
          author_name  varchar(100)  NOT NULL,
          phone_number varchar(20)   NOT NULL,
          title        varchar(50)   NOT NULL,
          description  varchar(1000) NOT NULL,
          image        varchar(500)           DEFAULT NULL,
          price        int(11)                DEFAULT NULL,
          createdAt    timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX identifier (identifier)
      )`);
  }

  async fetchPosts(limit: number): Promise<PagesRow[]> {
    const [rows] = await DbInterface._rawExec(
      `SELECT id, identifier, author_name, phone_number, title, description, image, price,
              CAST(UNIX_TIMESTAMP(createdAt) AS UNSIGNED) * 1000 AS createdAt
       FROM npwd_pages_posts
       ORDER BY id DESC
       LIMIT ${Math.trunc(limit)}`,
    );
    return <PagesRow[]>rows;
  }

  async addPost(post: Omit<PagesRow, 'id' | 'createdAt'>): Promise<number> {
    const [result] = await DbInterface._rawExec(
      `INSERT INTO npwd_pages_posts (identifier, author_name, phone_number, title, description, image, price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [post.identifier, post.author_name, post.phone_number, post.title, post.description, post.image, post.price],
    );
    return (<ResultSetHeader>result).insertId;
  }

  async deletePost(id: number, identifier: string): Promise<boolean> {
    const [result] = await DbInterface._rawExec('DELETE FROM npwd_pages_posts WHERE id = ? AND identifier = ?', [
      id,
      identifier,
    ]);
    return (<ResultSetHeader>result).affectedRows > 0;
  }
}

export const PagesDB = new _PagesDB();
