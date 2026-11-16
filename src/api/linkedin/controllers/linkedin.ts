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

      if (ctx.headers.accept && ctx.headers.accept.includes('text/html')) {
        ctx.type = 'html';
        ctx.body = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>LinkedIn Connected | Birendra Mishra CMS</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #041d56; color: #f8fafc; }
              .card { background: #072b7a; border: 1px solid rgba(255,255,255,0.15); padding: 2.5rem; border-radius: 12px; max-width: 480px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
              .icon { font-size: 3rem; margin-bottom: 1rem; color: #38bdf8; }
              h1 { font-size: 1.4rem; margin-bottom: 0.5rem; color: #ffffff; }
              p { color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; margin: 0.5rem 0; }
              .name-badge { display: inline-block; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 0.35rem 0.85rem; border-radius: 999px; font-weight: 600; margin: 0.75rem 0; }
              .btn { display: inline-block; margin-top: 1.5rem; background: #c5a059; color: #041d56; padding: 0.75rem 1.75rem; border-radius: 6px; text-decoration: none; font-weight: 700; transition: background 0.2s; }
              .btn:hover { background: #dfb76c; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">✓</div>
              <h1>LinkedIn Account Connected!</h1>
              <div class="name-badge">${tokenData.memberName || 'Birendra Mishra'}</div>
              <p>Your LinkedIn profile has been linked to your Strapi CMS.</p>
              <p>You can now check the <strong>"Post to LinkedIn"</strong> box when publishing articles to share them directly or at a scheduled time.</p>
              <a href="/admin" class="btn">Return to Strapi Admin Panel →</a>
            </div>
          </body>
          </html>
        `;
        return;
      }

      ctx.send({
        success: true,
        message: 'Successfully connected LinkedIn account.',
        data: {
          memberName: tokenData.memberName,
          memberUrn: tokenData.memberUrn,
        },
      });
    } catch (err: any) {
      if (ctx.headers.accept && ctx.headers.accept.includes('text/html')) {
        ctx.type = 'html';
        ctx.body = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; color: #f8fafc; margin: 0;">
            <div style="background: #1e293b; padding: 2.5rem; border-radius: 12px; max-width: 480px; text-align: center; border: 1px solid #ef4444;">
              <h2 style="color: #ef4444; margin-top: 0;">Connection Failed</h2>
              <p style="color: #cbd5e1;">${err.message}</p>
              <a href="/admin" style="display: inline-block; margin-top: 1rem; color: #38bdf8; text-decoration: underline;">Back to Admin</a>
            </div>
          </body>
          </html>
        `;
        return;
      }
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
        const article = await strapi.db.query('api::article.article').findOne({
          where: typeof articleId === 'number' ? { id: articleId } : { documentId: articleId },
        });
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

  async cleanupDummyArticles(ctx: any) {
    try {
      const dummySlugs = [
        'from-headline-to-financial-consequence',
        'capital-through-a-cfo-lens',
        'strategy-beyond-the-numbers',
      ];
      for (const dSlug of dummySlugs) {
        await strapi.db.query('api::article.article').deleteMany({
          where: { slug: dSlug },
        });
      }
      await strapi.db.query('api::article.article').deleteMany({
        where: { documentId: 'cn89hor982fls5pg9upp6i2y' },
      });
      ctx.send({
        success: true,
        message: 'Legacy dummy articles deleted successfully. Now only your authentic articles remain in the database.',
      });
    } catch (err: any) {
      ctx.badRequest(err.message);
    }
  },
});
