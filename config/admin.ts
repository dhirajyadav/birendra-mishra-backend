export default ({ env }: { env: any }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'testAdminJwtSecret1234567890!'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'testApiTokenSalt1234567890!'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'testTransferSalt1234567890!'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', false),
    promoteEE: env.bool('FLAG_PROMOTE_EE', false),
  },
});

