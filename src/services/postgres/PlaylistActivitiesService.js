const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToActivitiesModel } = require('../../utils');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async createPlaylistActivities({
    playlistId, songId, userId, action,
  }) {
    const id = `playlist_activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Failed to create playlist activities.');
    }

    return result.rows[0].id;
  }

  async getPlaylistActivities(id) {
    const query = {
      text: `SELECT t1.playlist_id, t3.username, t2.title, t1.action, t1.time 
        FROM playlist_song_activities t1
        INNER JOIN songs t2 ON t1.song_id = t2.id
        INNER JOIN users t3 ON t1.user_id = t3.id
        WHERE t1.playlist_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    const activities = result.rows.map(mapDBToActivitiesModel);
    const playlistId = result.rows[0].playlist_id;

    return {
      playlistId,
      activities,
    };
  }
}

module.exports = PlaylistSongActivitiesService;
