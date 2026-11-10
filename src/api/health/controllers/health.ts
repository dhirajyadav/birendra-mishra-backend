export default ({ strapi }: { strapi: any }) => ({
  async check(ctx: any) {
    let dbStatus = 'connected';
    try {
      if (strapi.db && strapi.db.connection) {
        await strapi.db.connection.raw('SELECT 1');
      }
    } catch (e: any) {
      dbStatus = 'disconnected';
    }

    ctx.send({
      status: 'ok',
      service: 'Birendra Mishra Strapi CMS',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  },
});

