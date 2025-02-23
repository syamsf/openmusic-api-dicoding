const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToAlbumsModel, mapDBToSongsModel } = require('../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async createAlbum({ name, year }) {
    const generatedId = nanoid(16);
    const id = `album-${generatedId}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to create album.');
    }

    return result.rows[0].id;
  }

  async getAlbums({ name, year }) {
    const query = {
      text: 'SELECT * FROM albums',
      values: [],
    };

    const conditions = [];

    if (name && name !== '') {
      conditions.push(`name ILIKE $${conditions.length + 1}`);
      query.values.push(`%${name}%`);
    }

    if (year && year !== 0) {
      conditions.push(`year = $${conditions.length + 1}`);
      query.values.push(year);
    }

    if (conditions.length > 0) {
      query.text += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToAlbumsModel);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT t1.*, t2.id as song_id, t2.title as song_title, t2.performer as song_performer FROM albums t1 LEFT JOIN songs t2 ON t1.id=t2.album_id  WHERE t1.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album is not found.');
    }

    const songs = result.rows.map((row) => (
      mapDBToSongsModel({
        id: row.song_id,
        title: row.song_title,
        performer: row.song_performer,
      })
    )).filter((item) => item.id !== null);

    return {
      ...result.rows.map(mapDBToAlbumsModel)[0],
      songs,
    };
  }

  async updateAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update album. Id is not found.');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete album. Id is not found.');
    }
  }
}

module.exports = AlbumsService;
