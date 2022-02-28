# hasura-watchtower
A refreshed control plane for managing your Hasura instance.

npm i sequalize
npx sequelize-cli init
npx sequelize-cli model:generate --name User --attributes username:string,password:string,allow_users:boolean,allow_graphql:boolean,allow_metadata:boolean,allow_migrations:boolean

npx sequelize-cli db:migrate

npx sequelize-cli seed:generate --name demo-user
npx sequelize-cli db:seed:all