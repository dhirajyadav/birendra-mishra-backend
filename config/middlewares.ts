export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http:', 'https://proxy-event.ckeditor.com', 'https://*.ckeditor.com', 'https://cdn.ckeditor.com'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:', 'https://cdn.ckeditor.com', 'https://*.ckeditor.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.ckeditor.com', 'https://*.ckeditor.com'],
          'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.ckeditor.com', 'https://*.ckeditor.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'https://birendramishra.com',
        'https://www.birendramishra.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '50mb',
      jsonLimit: '50mb',
      textLimit: '50mb',
      formidable: {
        maxFileSize: 50 * 1024 * 1024, // 50mb
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

