const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.createAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums',
    handler: handler.getAllAlbumsHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.updateAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
];

module.exports = routes;
