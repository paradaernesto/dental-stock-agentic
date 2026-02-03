# Install & Prime

## Read
.env.example (never read .env)

## Read and Execute
.claude/commands/prime.md

## Run
- Install dependencies: `pnpm install`
- Copy environment: `cp .env.example .env`
- Setup database: `pnpm db:push`
- Seed database (optional): `pnpm db:seed`

## Report
- Output the work you've just done in a concise bullet point list
- Instruct the user to fill out `./.env` based on `.env.example`
- Mention the URL: http://localhost:3000
- Mention: 'To push to GitHub:
  ```
  git remote add origin <your-new-repo-url>
  git push -u origin main
  ```'
