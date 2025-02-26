const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async createCollaboration({ playlistId, userId }) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add collaborator.');
    }

    await this._cacheService.delete(`playlistByOwner:${userId}`);
    await this._cacheService.delete(`playlistSongs:${playlistId}`);

    return result.rows[0].id;
  }

  async deleteCollaboration({ playlistId, userId }) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete collaborator. Id is not found.');
    }

    await this._cacheService.delete(`playlistByOwner:${userId}`);
    await this._cacheService.delete(`playlistSongs:${playlistId}`);
  }
}

module.exports = CollaborationService;
