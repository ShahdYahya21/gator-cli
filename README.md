## Blog Aggregator CLI

### Based on all the commands you’ve listed, your Blog Aggregator CLI is a terminal-based tool that lets users register, log in, manage feeds, aggregate posts, and browse content.
-----
## Setup
1.  **Clone the repository**  
```bash
git clone <repo-url>
cd <repo-folder>
```
2. Install Node.js using NVM
   
  - Install NVM (Node Version Manager)
  - add a .nvmrc file to the root of your project with :
    ```bash
    22.15.0
    ```
  - Activate Node.js
     ```bash
     nvm use
    ```
  - Check version
     ```bash
    node --version
    # Should print: v22.15.0
     ```
3. Install dependencies
     ```bash
       # Install runtime dependencies
    npm install drizzle-orm postgres fast-xml-parser
    
    # Install development dependencies
    npm install -D drizzle-kit @types/fast-xml-parser typescript ts-node
     ```
     - `@types/fast-xml-parser` – Adds TypeScript type definitions so your project can type-check feed parsing properly.
     - `typescript` and `ts-node` – If your CLI is written in TypeScript, these make running scripts easier.
     - Keeping `drizzle-kit` as a dev dependency since it’s only used for migrations.
4. Setup the database
   - Start Postgres:
      - macOS: 
       ```bash
        brew services start postgresql@16
       ```
       - Linux / WSL:
        ```bash
        sudo service postgresql start
       ```
     - Enter the Postgres shell
        - macOS: 
       ```bash
        psql postgres
       ```
       - Linux / WSL:
        ```bash
        sudo -u postgres psql
       ```
       You should see:
         ```bash
        postgres=#
       ```
       Create a new database:
          ```SQL
       CREATE DATABASE gator;
        \c gator
       ```
       Prompt changes to:
       ```bash
        gator=#
       ```
       Set user password (Linux only):
        ```SQL
        ALTER USER postgres PASSWORD 'postgres';
       ```
       Test queries:
         ```SQL
        SELECT version();
       ```
5. Create the configuration file
   - Create ~/.gatorconfig.json in your home directory:
       ```json
       {
        "db_url": "postgres://username:password@localhost:5432/gator?sslmode=disable"
      }
      ```
  6. Run Migrations
     - I already have in packge.json
          ```JSON
            {
          "scripts": {
            "generate": "drizzle-kit generate",
            "migrate": "drizzle-kit migrate"
          }
         }
       ```
      Generate and apply migrations
     ```Bash
          npm run generate   # Generate migration files
          npm run migrate    # Apply migrations to the database
       ```
7. Run the commands
   - Before running any CLI commands, start the application:
     ```bash
     # Using the npm script
     npm run start

     # Or directly with ts-node if using TypeScript
     npx ts-node src/index.ts
     ```
----
## Commands

To run any command, start the CLI and pass the command name as an argument. For example, to run the `login` command:  

```bash
npm run start login
```

### Command List

- `register` – Create a new user account.
  ```bash
    npm run start register <user name>
  ```
  Prompts for a password after entering the username.

- `login` – Log in to your existing account.
    ```bash
   npm run start login <user name>
  ```

- `addfeed` – Add a new RSS feed to your account.
   ```bash
  npm run start addfeed <feed name> <feed url>
  ```

- `agg` – Aggregate posts from all feeds at a specified interval.
   ```bash
  npm run start agg <time_between_reqs>
  ```
   `time_between_reqs` is a duration string, e.g., 1s, 1m, 1h.
   This fetches new posts from all feeds, saves them to the database, and skips duplicates.
  
   Press Ctrl+C to stop safely.

- `feeds` – List all available feeds in the system.
   ```bash
  npm run start feeds
  ```

- `follow` – Follow a feed to receive its posts.
   ```bash
   npm run start follow <feed url>
  ```
   
- `unfollow` – Unfollow a feed.
    ```bash
  npm run start unfollow <feed url>
  ```

- `following` – List feeds you are currently following.
   ```bash
   npm run start following
  ```

- `browse` – View the latest posts from feeds you follow.
     ```bash
  npm run start browse [limit]
  ```
  Optional limit parameter specifies the number of posts to display. Defaults to 2.

- `users` – List all registered users.
  ```bash
  npm run start users
  ```

- `reset` – Reset your account/session.
    ```bash
  npm run start reset
  ```

----
## RSS Feeds you can try:

- TechCrunch: https://techcrunch.com/feed/
- Hacker News: https://news.ycombinator.com/rss
- Boot.dev Blog: https://www.boot.dev/blog/index.xml




