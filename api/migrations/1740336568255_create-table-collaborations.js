/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(100)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"playlist"("id")',
      onDelete: 'cascade',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"("id")',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
