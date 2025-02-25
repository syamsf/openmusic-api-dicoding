const { Pool } = require('pg');

class PlaylistService {
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
       WHERE t1.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error('Playlist is not found.');
    }

    const songs = result.rows.map((row) => ({
      id: row.song_id,
      title: row.song_title,
      performer: row.song_performer,
    })).filter((item) => item.id !== null);

    const playlistDetails = {
      id: result.rows[0].id,
      name: result.rows[0].name,
    };

    return {
      ...playlistDetails,
      songs,
    };
  }
}

module.exports = PlaylistService;
