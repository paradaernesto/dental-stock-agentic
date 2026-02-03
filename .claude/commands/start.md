# Start the application

## Variables

PORT: 3000 (default Next.js port)

## Workflow

1. Check if a process is already running on port PORT:
   - If yes, open http://localhost:PORT in browser
   - If no, continue to step 2

2. Start the application:
   - Run `pnpm dev` in background (or use `nohup pnpm dev > /dev/null 2>&1 &`)
   - Wait 3 seconds
   - Open http://localhost:PORT in browser

3. Report that the application is running
