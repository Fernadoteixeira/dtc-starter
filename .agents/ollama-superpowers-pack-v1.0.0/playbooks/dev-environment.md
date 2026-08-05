# Development environment bring-up

1. Inspect package scripts and environment files.
2. Check expected ports before starting services.
3. Start dependencies/backend first and wait for readiness.
4. Start the frontend once its upstream API is healthy.
5. Capture stdout/stderr to timestamped logs.
6. Verify HTTP status and one representative route.
7. Record PID, port, framework version, startup time and errors.
8. Avoid launching duplicate servers.
