const dotenv = require('dotenv');
dotenv.config();

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, name: process.env.WATCHTOWER_ADMIN_USER| 'username' , password: process.env.WATCHTOWER_ADMIN_USER | 'password', allow_users: true, allow_graphql: true, allow_metadata: true, allow_migrations: true},
      ]);
    });
};
