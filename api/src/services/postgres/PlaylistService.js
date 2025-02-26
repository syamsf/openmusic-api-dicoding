const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToPlaylistModel } = require('../../utils');

class PlaylistService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async createPlaylist({ name, ownerId }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
      values: [id, name, ownerId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Failed to create playlist.');
    }

    return result.rows[0].id;
  }

  async getPlaylist(ownerId) {
    const playlistKey = `playlistByOwner:${ownerId}`;

    const cachedData = await this._cacheService.get(playlistKey);
    if (cachedData !== null) {
      return { data: JSON.parse(cachedData), isCached: true };
    }

    const query = {
      text: `SELECT t1.id, t1.name, t2.username FROM playlist t1
        LEFT JOIN users t2 ON t1.owner_id = t2.id
        LEFT JOIN collaborations t3 ON t1.id = t3.playlist_id
        WHERE t1.owner_id = $1 OR t3.user_id = $1
        GROUP BY (t1.id, t2.username, t1.name)`,
      values: [ownerId],
    };

    const result = await this._pool.query(query);

    const expiredIn30Minutes = 30 * 60;
    await this._cacheService.set(
      playlistKey,
      JSON.stringify(result.rows.map(mapDBToPlaylistModel)),
      expiredIn30Minutes,
    );

    return { data: result.rows.map(mapDBToPlaylistModel), isCached: false };
  }

  async deletePlaylist(playlistId, ownerId) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete playlist. Id is not found.');
    }

    await this._cacheService.delete(`playlist:${playlistId}`);
    await this._cacheService.delete(`playlistByOwner:${ownerId}`);
    await this._cacheService.delete(`playlistSongs:${playlistId}`);
  }

  async verifyPlaylistOwner(playlistId, userId, verifyCollaborator = false) {
    const query = {
      text: `SELECT t1.owner_id, t2.user_id
       FROM playlist t1
       LEFT JOIN collaborations t2 ON t1.id = t2.playlist_id
       WHERE t1.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found.');
    }

    const ownerId = result.rows[0].owner_id;
    const collaboratorIds = result.rows.map((row) => row.user_id).filter((id) => id !== null);

    if (ownerId === userId) {
      return;
    }

    if (verifyCollaborator && collaboratorIds.includes(userId)) {
      return;
    }

    throw new AuthorizationError();
  }

  async getPlaylistById(playlistId) {
    const playlistKey = `playlist:${playlistId}`;

    const cachedData = await this._cacheService.get(playlistKey);
    if (cachedData !== null) {
      return { data: JSON.parse(cachedData), isCached: true };
    }

    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found.');
    }

    const expiredIn30Minutes = 30 * 60;
    await this._cacheService.set(playlistKey, JSON.stringify(result.rows[0]), expiredIn30Minutes);

    return { data: result.rows[0], isCached: false };
  }
}

module.exports = PlaylistService;
