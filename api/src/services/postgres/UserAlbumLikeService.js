const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikeService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likeAlbum(albumId, userId) {
    const id = `likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to like album.');
    }

    await this._cacheService.delete(`albums_likes:${albumId}`);
  }

  async unlikeAlbum(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to unlike album.');
    }

    await this._cacheService.delete(`albums_likes:${albumId}`);
  }

  async getLikesCount(albumId) {
    const query = {
      text: 'SELECT COUNT(*) as total FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    const expiredIn30Minutes = 30 * 60;
    const albumLikesKey = `albums_likes:${albumId}`;

    const cachedData = await this._cacheService.get(albumLikesKey);
    if (cachedData !== null) {
      return { total: parseInt(cachedData, 10), isCached: true };
    }

    const parsedTotal = parseInt(result.rows[0].total, 10);
    await this._cacheService.set(`albums_likes:${albumId}`, parsedTotal, expiredIn30Minutes);

    return { total: parsedTotal, isCached: false };
  }

  async isAlreadyLikedAnAlbum(albumId, userId) {
    const query = {
      text: 'SELECT COUNT(*) as total FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);
    if (parseInt(result.rows[0].total, 10) >= 1) {
      throw new InvariantError('User already liked this album.');
    }
  }
}

module.exports = UserAlbumLikeService;
