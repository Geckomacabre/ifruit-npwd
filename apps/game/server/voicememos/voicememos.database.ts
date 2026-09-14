import { ResultSetHeader } from 'mysql2';
import { DbInterface } from '@npwd/database';
import { VoiceMemo } from '@typings/voicememos';

export class _VoiceMemosDB {
  // Also in import.sql; created here so an existing server needs no manual import.
  async ensureTable(): Promise<void> {
    await DbInterface._rawExec(`
      CREATE TABLE IF NOT EXISTS npwd_voice_memos
      (
          id         int(11)      NOT NULL AUTO_INCREMENT,
          identifier varchar(48)  NOT NULL COLLATE 'utf8mb4_general_ci',
          name       varchar(50)  NOT NULL,
          url        varchar(500) NOT NULL,
          duration   int(11)      NOT NULL DEFAULT 0,
          createdAt  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX identifier (identifier)
      )`);
  }

  async fetchMemos(identifier: string): Promise<VoiceMemo[]> {
    const [rows] = await DbInterface._rawExec(
      `SELECT id, name, url, duration, CAST(UNIX_TIMESTAMP(createdAt) AS UNSIGNED) * 1000 AS createdAt
       FROM npwd_voice_memos
       WHERE identifier = ?
       ORDER BY id DESC
       LIMIT 200`,
      [identifier],
    );
    return (<VoiceMemo[]>rows).map((row) => ({ ...row, createdAt: Number(row.createdAt) }));
  }

  async addMemo(identifier: string, name: string, url: string, duration: number): Promise<VoiceMemo> {
    const [result] = await DbInterface._rawExec(
      'INSERT INTO npwd_voice_memos (identifier, name, url, duration) VALUES (?, ?, ?, ?)',
      [identifier, name, url, duration],
    );
    return { id: (<ResultSetHeader>result).insertId, name, url, duration, createdAt: Date.now() };
  }

  async renameMemo(id: number, identifier: string, name: string): Promise<boolean> {
    const [result] = await DbInterface._rawExec(
      'UPDATE npwd_voice_memos SET name = ? WHERE id = ? AND identifier = ?',
      [name, id, identifier],
    );
    return (<ResultSetHeader>result).affectedRows > 0;
  }

  async deleteMemo(id: number, identifier: string): Promise<void> {
    await DbInterface._rawExec('DELETE FROM npwd_voice_memos WHERE id = ? AND identifier = ?', [id, identifier]);
  }
}

export const VoiceMemosDB = new _VoiceMemosDB();
