export default {
  routes: [
    { method: 'GET', path: '/site-content/homepage', handler: 'public-site.homepage', config: { auth: false } },
    { method: 'GET', path: '/site-content/pages/:slug', handler: 'public-site.page', config: { auth: false } },
  ],
};
