const mapDBToAlbumsModel = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
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

module.exports = { mapDBToAlbumsModel, mapDBToSongsModel, mapDBToSingleSongModel };
