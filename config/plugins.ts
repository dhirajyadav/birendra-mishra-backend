export default () => ({
  'users-permissions': { config: { jwt: { expiresIn: '1d' }, ratelimit: { interval: { min: 1 }, max: 5, timeWait: 60 } } },
  upload: { config: { sizeLimit: 5 * 1024 * 1024, security: { allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'], deniedTypes: ['image/svg+xml'] } } },
});
