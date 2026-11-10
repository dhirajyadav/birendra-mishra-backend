export default {
  // LinkedIn Scheduled Publishing Worker - runs every minute
  '*/1 * * * *': async ({ strapi }: { strapi: any }) => {
    try {
      const linkedinService = strapi.service('api::linkedin.linkedin');
      if (linkedinService && typeof linkedinService.processScheduledQueue === 'function') {
        await linkedinService.processScheduledQueue();
      }
    } catch (err: any) {
      strapi.log.error(`[LinkedIn Cron Worker Error]: ${err.message}`);
    }
  },
};

