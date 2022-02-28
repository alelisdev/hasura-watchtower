exports.up = function(knex) {
    return knex.schema
      .createTable('users', function (table) {
        table.increments('id');
        table.string('name', 255).notNullable();
        table.string('password', 255).notNullable()
        table.boolean('allow_users', true);
        table.boolean('allow_graphql', true);
        table.boolean('allow_metadata', true);
        table.boolean('allow_migrations', true);
        table.timestamps();
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTable('users');
  };
  