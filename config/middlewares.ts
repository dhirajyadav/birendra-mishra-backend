export default ({ env }) => {
  const allowlist = env.array('CORS_ORIGINS', ['http://localhost:8000']);
  return ['strapi::logger', 'strapi::errors', 'strapi::security',
    { name: 'strapi::cors', config: { origin: allowlist, methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'], headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'], credentials: false, keepHeaderOnError: true } },
    'strapi::poweredBy', 'strapi::query', 'strapi::body', 'strapi::session', 'strapi::favicon', 'strapi::public'];
};
