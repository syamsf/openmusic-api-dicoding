const config = require('./config');

const mapDBToAlbumsModel = ({
  id,
  name,
  year,
  cover_filename,
}) => ({
  id,
  name,
  year,
  coverUrl: cover_filename ? `http://${config.app.host}:${config.app.port}/upload/images/${cover_filename}` : null,
});

const mapDBToSongsModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

const mapDBToSingleSongModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapDBToPlaylistModel = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

const mapDBToActivitiesModel = ({
  username,
  title,
  action,
  time,
}) => ({
  username,
  title,
  action,
  time,
});

module.exports = {
  mapDBToAlbumsModel,
  mapDBToSongsModel,
  mapDBToSingleSongModel,
  mapDBToPlaylistModel,
  mapDBToActivitiesModel,
};
