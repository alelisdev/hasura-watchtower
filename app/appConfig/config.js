const dotenv = require('dotenv');
dotenv.config();

const required = [
  'NODE_ENV'
];

const envs = {
  NODE_ENV: process.env.NODE_ENV
};

(() => {
  const notMeetRequirements = required.filter((v) => !process.env[v]);
  if (notMeetRequirements.length) {
    // eslint-disable-next-line no-console
    console.log(
      `ERROR: Missing required environment variables: ${notMeetRequirements.join(
        ', '
      )})`
    );
    process.exit(1);
  }
  required.forEach((v) => {
    envs[v] = process.env[v];
  });
})();

module.exports = envs;
