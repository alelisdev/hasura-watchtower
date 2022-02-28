'use strict';
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     */
    
     await queryInterface.bulkInsert('Users', [{
      username: process.env.WATCHTOWER_ADMIN_USER,
      password: process.env.WATCHTOWER_ADMIN_PASS,
      allow_users: true,
      allow_graphql: true,
      allow_metadata: true,
      allow_migrations: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
     }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here. */

    await queryInterface.bulkDelete('Users', null, {});
  }
};
