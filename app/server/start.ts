// Production entry: sets NODE_ENV portably (works on Windows too), then boots the server.
export {};
process.env.NODE_ENV = 'production';
await import('./index.ts');
