export default {
  routes: [
    {
      method: 'GET',
      path: '/linkedin/auth',
      handler: 'linkedin.getAuthUrl',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/linkedin/auth-url',
      handler: 'linkedin.getAuthUrl',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/linkedin/callback',
      handler: 'linkedin.callback',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/linkedin/status',
      handler: 'linkedin.getStatus',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/linkedin/disconnect',
      handler: 'linkedin.disconnect',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/linkedin/publish',
      handler: 'linkedin.publishNow',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/linkedin/schedule',
      handler: 'linkedin.schedule',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/linkedin/queue',
      handler: 'linkedin.getQueue',
      config: {
        auth: false,
      },
    },
  ],
};

