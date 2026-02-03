# Prepare Application

Start the application for review or testing.

## Instructions

1. Check if app is already running on port 3000
2. If not running, start it: `pnpm dev` (background)
3. Wait for it to be ready
4. Report status

## Run

```bash
# Check if port is in use
lsof -i :3000 || echo "Port 3000 is free"

# Start if needed
pnpm dev &
sleep 3
```

## Report

- Application status
- URL to access (http://localhost:3000)
