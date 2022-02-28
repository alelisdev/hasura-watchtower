## Environment variable
Env variables:
- `WATCHTOWER_SECRET` > secret for signing this service's sessions / etc.
- `WATCHTOWER_ADMIN_USER` > (optional) Seed admin user (will have full credentials)
- `WATCHTOWER_ADMIN_PASS` > (optional) Seed admin password
- `HASURA_URL` > URL of Hasura instance
- `HASURA_ADMIN_SECRET` > secret API key for server we're proxying

---

## On container start
- Initiate database model if doesn't exist (at `home/node/project/userdb.sqlite`)
- Initiate initial seed user using the `WATCHTOWER_ADMIN_USER` and `WATCHTOWER_ADMIN_PASS`

---

## Database model
### `user`
- id > INT (Autoincrement)
- username > TEXT
- password > TEXT
- allow_users > INT (Boolean - 1,0)
- allow_graphql > INT (Boolean - 1,0)
- allow_metadata > INT (Boolean - 1,0)
- allow_migrations > INT (Boolean - 1,0)

---

## Auth
### `/v1/auth/login`
**Method**:
- POST

**Arguments**:
- Username
- Password

**Logic**:
- Returns a session as a httpOnly cookie which will be used for auth

---

## Users
// Authenticated user has `allow_users` permission attribute

### `/v1/users`
**Method**:
- GET

**Response**:
- username
- allow_users
- allow_graphql
- allow_metadata
- allow_migrations

**Logic**:
- Gets users from SQLite database via Knex

### `/v1/user/create`
**Method**:
- POST

**Arguments**:
- username
- allow_users
- allow_graphql
- allow_metadata
- allow_migrations
- password

**Response**:
- 200: User Created

**Logic**:
- Created user with hashed password in Knex database

### `/v1/user/[id]`
**Method**:
- GET

**Response**:
- username
- allow_users
- allow_graphql
- allow_metadata
- allow_migrations

**Logic**:
- Gets user ID from  SQLite database via Knex

### `/v1/user/edit/[id]`
**Method**:
- POST

**Arguments**:
- username
- allow_users
- allow_graphql
- allow_metadata
- allow_migrations
- password (optional)

**Response**:
- 200: User Updated

**Logic**:
- Updates user ID in Knex database - re-hash if password present

### `/v1/user/delete/[id]`
**Method**:
- DELETE

**Response**:
- 200: User Deleted

**Logic**:
- Delete's user ID in Knex database

---

## GraphQL
// Authenticated user has `allow_graphql` permission attribute

### `/v1/graphql`
- Proxy for GraphQL endpoint - takes in body / headers - replaces with admin secret. 

**Method**: 
- POST

**Proxies**:
- https://hasura.io/docs/latest/graphql/core/api-reference/graphql-api/index.html#endpoint

**Headers**:
- Set  `x-hasura-admin-secret` from environment variable `HASURA_ADMINSECRET`
- Pass through other headers

**Arguments**:
- Pass on arguments as body

---

## Metadata
// Authenticated user has `allow_metadata` permission attribute

**Proxy Headers:**
- Set `x-hasura-admin-secret` as environment variable `HASURA_ADMINSECRET`
- Set `x-hasura-role` as `admin`

### `/v1/metadata/get`
- Gets metadata - saves as JSON to directory.

**Method**:
- GET

**Proxies**:
- https://hasura.io/docs/latest/graphql/core/api-reference/metadata-api/manage-metadata.html#export-metadata
```json
{
     "type": "export_metadata",
     "version": 2,
     "args": {}
}
```

**Response**:
- JSON

**Logic**:
- Gets metadata as JSON
- Saves metadata to `/home/node/project/metadata` folder
	- As `{user}_{datetime}_metadata_get.json`

### `/v1/metadata/set`
- Updates metadata - shows status  - saves copy of backup before applying.

**Method**: 
- POST

**Proxies**:
- https://hasura.io/docs/latest/graphql/core/api-reference/metadata-api/manage-metadata.html#export-metadata then ->
- https://hasura.io/docs/latest/graphql/core/api-reference/metadata-api/manage-metadata.html#replace-metadata

**Arguments**:
	- JSON (metadata)
```json
{
    "type" : "replace_metadata",
    "version": 2
    "args": {
      "allow_inconsistent_metadata": true,
      "metadata": <JSON_APPLIED_HERE>
    }
}
```

**Response**:
- JSON

**Logic**:
- Gets metadata backup as JSON through metadata export
	- Saves metadata to `/home/node/project/metadata` folder
		- As `{user}_{datetime}_metadata_backup.json`
- Then posts metadata
- Gets metadata backup as JSON through metadata export
	- Saves metadata's JSON to `/home/node/project/metadata` folder
		- As `{user}_{datetime}_metadata_set.json`


### `/v1/metadata/history`
- Gets metadata which has been saved previously.

**Method**:
- GET

**Response**:
- Gets file list from `home/node/project/metadata` directory
- JSON - breaks up:
	- User
	- Datetime
	- Filename

### `/v1/metadata/history/[filename]`
- Shows data from JSON file.

**Method**:
- GET

**Response**:
- Displays data from filename

---

## Migrations
// Authenticated user has `allow_migration` permission attribute

**Proxy Headers:**
- Set `x-hasura-admin-secret` as environment variable `HASURA_ADMINSECRET`
- Set `x-hasura-role` as `admin`

### `/v1/migration/set`
- Runs some SQL against data source - saves SQL to directory.

**Method**:
- POST

**Proxies**:
- https://hasura.io/docs/latest/graphql/core/api-reference/schema-api/run-sql.html#run-sql

**Arguments**:
- source (optional -> default to `default`)
- sql
```json
{
    "type": "run_sql",
    "args": {
        "source": <SOURCE_APPLIED_HERE>,
        "sql": <SQL_APPLIED_HERE>
    }
}
```

**Response**:
- JSON response

**Logic**:
- If response = 200:
	- Saves the run SQL to `/home/node/project/migration` folder
	- `{user}_{datetime}_{source}_success.json`
- If response != 200:
	- Saves the run SQL to `/home/node/project/failure` folder
	- `{user}_{datetime}_{source}_success.json`

### `/v1/migration/history`
- Gets SQL which has been saved previously.

**Method**:
- GET

**Response**:
- Gets file list from `home/node/project/migration` directory
- JSON - breaks up:
	- User
	- Datetime
	- Source
	- Success / Failure State
	- Filename 

### `/v1/migration/history/[filename]`
- Shows data (text) from SQL file.

**Method**:
- GET

**Response**:
- Displays data from filename