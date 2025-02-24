const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToSongsModel, mapDBToSingleSongModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async createSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const generatedId = nanoid(16);
    const id = `song-${generatedId}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to create song.');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    const query = {
      text: 'SELECT * FROM songs',
      values: [],
    };

    const conditions = [];

    if (title && title !== '') {
      conditions.push(`title ILIKE $${conditions.length + 1}`);
      query.values.push(`%${title.toLowerCase()}%`);
    }

    if (performer && performer !== '') {
      conditions.push(`performer ILIKE $${conditions.length + 1}`);
      query.values.push(`%${performer.toLowerCase()}%`);
    }
    if (conditions.length > 0) {
      query.text += ` WHERE ${conditions.join(' AND ')}`;
    }
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToSingleSongModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song is not found.');
    }

    return mapDBToSongsModel(result.rows[0]);
  }

  async updateSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to update song. Id is not found.');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete song. Id is not found.');
    }
  }
}

module.exports = SongsService;
