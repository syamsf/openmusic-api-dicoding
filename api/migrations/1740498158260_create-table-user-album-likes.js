/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"("id")',
      onDelete: 'cascade',
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"albums"("id")',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('user_album_likes', 'unique_album_likes_album_id_and_user_id', 'UNIQUE(album_id, user_id)');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
