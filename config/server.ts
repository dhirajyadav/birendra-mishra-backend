import cronTasks from './cron-tasks';

export default ({ env }: { env: any }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  app: {
    keys: env.array('APP_KEYS', ['testKeyA1234567890==', 'testKeyB1234567890==']),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  logger: {
    updates: {
      enabled: false,
    },
  },
  cron: {
    enabled: true,
    tasks: cronTasks,
  },
});

