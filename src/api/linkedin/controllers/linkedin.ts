export default ({ strapi }: { strapi: any }) => ({
  async getAuthUrl(ctx: any) {
    try {
      const url = strapi.service('api::linkedin.linkedin').getAuthUrl();
      if (ctx.query.redirect === 'true' || (ctx.headers.accept && ctx.headers.accept.includes('text/html'))) {
        return ctx.redirect(url);
      }
      ctx.send({ url });
    } catch (err: any) {
      ctx.badRequest(err.message);
    }
  },

  async callback(ctx: any) {
    const { code, state, error, error_description } = ctx.query;

    if (error) {
      return ctx.badRequest(`LinkedIn authorization error: ${error_description || error}`);
    }

    if (!code) {
      return ctx.badRequest('Missing authorization code');
    }

    try {
      const tokenData = await strapi.service('api::linkedin.linkedin').exchangeCodeForToken(code);
      ctx.send({
        success: true,
        message: 'Successfully connected LinkedIn account.',
        data: {
          memberName: tokenData.memberName,
          memberUrn: tokenData.memberUrn,
        },
      });
    } catch (err: any) {
      ctx.badRequest(err.message);
    }
  },

  async getStatus(ctx: any) {
    try {
      const status = await strapi.service('api::linkedin.linkedin').getConnectionStatus();
      ctx.send(status);
    } catch (err: any) {
      ctx.badRequest(err.message);
    }
  },

  async disconnect(ctx: any) {
    try {
      const result = await strapi.service('api::linkedin.linkedin').disconnect();
      ctx.send(result);
    } catch (err: any) {
      ctx.badRequest(err.message);
    }
  },

  async publishNow(ctx: any) {
    const { articleId, caption, articleUrl, imageUrl } = ctx.request.body;

    if (!caption && !articleId) {
      return ctx.badRequest('Please provide either articleId or caption.');
    }

    try {
      let finalCaption = caption;
      let finalUrl = articleUrl;

      if (articleId) {
        const article = await strapi.entityService.findOne('api::article.article', articleId);
        if (article) {
          finalCaption =
            caption ||
            article.linkedInCaption ||
            `${article.title}\n\n${article.excerpt || article.shortDescription || ''}\n\nRead more: https://birendramishra.com/insights/${article.slug}`;
          finalUrl = articleUrl || `https://birendramishra.com/insights/${article.slug}`;
        }
      }

      const result = await strapi.service('api::linkedin.linkedin').publishPost({
        articleId,
        caption: finalCaption,
        articleUrl: finalUrl,
        imageUrl,
      });

      ctx.send(result);
    } catch (err: any) {
      ctx.badRequest(err.message);
    }
  },

  async schedule(ctx: any) {
    const { articleId, scheduledPublishAt, caption } = ctx.request.body;

    if (!articleId || !scheduledPublishAt) {
      return ctx.badRequest('Please provide articleId and scheduledPublishAt.');
    }

    try {
      const updated = await strapi.entityService.update('api::article.article', articleId, {
        data: {
          scheduledPublishAt,
          linkedInPublishStatus: 'scheduled',
          linkedInCaption: caption,
          linkedInErrorMessage: null,
        },
      });
      ctx.send({ success: true, data: updated });
    } catch (err: any) {
      ctx.badRequest(err.message);
    }
  },

  async getQueue(ctx: any) {
    try {
      const articles = await strapi.entityService.findMany('api::article.article', {
        filters: {
          linkedInPublishStatus: {
            $in: ['scheduled', 'processing', 'published', 'failed'],
          },
        },
        sort: { scheduledPublishAt: 'desc' },
      });
      ctx.send({ data: articles });
    } catch (err: any) {
      ctx.badRequest(err.message);
    }
  },
});
