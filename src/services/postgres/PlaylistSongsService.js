const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToSongsModel, mapDBToPlaylistModel } = require('../../utils');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistByIdWithSongs(id) {
    const query = {
      text: `SELECT 
        t1.*, 
        (SELECT(username) FROM users WHERE id = t1.owner_id LIMIT 1) as username,
        t3.id as song_id,
        t3.title as song_title,
        t3.performer as song_performer
      FROM playlist t1
      LEFT JOIN playlist_songs t2 ON t1.id = t2.playlist_id
      LEFT JOIN songs t3 on t3.id = t2.song_id
      LEFT JOIN collaborations t4 on t4.playlist_id = t1.id
      WHERE t1.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist is not found.');
    }

    const songs = result.rows.map((row) => (
      mapDBToSongsModel({
        id: row.song_id,
        title: row.song_title,
        performer: row.song_performer,
      })
    )).filter((item) => item.id !== null);

    return {
      ...mapDBToPlaylistModel(result.rows[0]),
      songs,
    };
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist_songs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add song to playlist.');
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete song from playlist. Id is not found.');
    }
  }
}

module.exports = PlaylistSongsService;
