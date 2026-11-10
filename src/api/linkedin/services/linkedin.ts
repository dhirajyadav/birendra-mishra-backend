import axios from 'axios';

export interface LinkedInTokenData {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
  memberUrn?: string;
  memberName?: string;
}

export default ({ strapi }: { strapi: any }) => ({
  getClientConfig() {
    return {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      redirectUri:
        process.env.LINKEDIN_REDIRECT_URI || 'https://api.birendramishra.com/api/linkedin/callback',
      scopes: ['openid', 'profile', 'email', 'w_member_social'],
      isMockMode: !process.env.LINKEDIN_CLIENT_ID || process.env.LINKEDIN_MOCK_MODE === 'true',
    };
  },

  async getStoredToken(): Promise<LinkedInTokenData | null> {
    const pluginStore = strapi.store({ type: 'plugin', name: 'linkedin' });
    return (await pluginStore.get({ key: 'token' })) as LinkedInTokenData | null;
  },

  async setStoredToken(tokenData: LinkedInTokenData | null) {
    const pluginStore = strapi.store({ type: 'plugin', name: 'linkedin' });
    await pluginStore.set({ key: 'token', value: tokenData });
  },

  getAuthUrl(state: string = 'bm_auth_state') {
    const config = this.getClientConfig();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId || 'MOCK_CLIENT_ID',
      redirect_uri: config.redirectUri,
      state,
      scope: config.scopes.join(' '),
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  },

  async exchangeCodeForToken(code: string) {
    const config = this.getClientConfig();

    if (config.isMockMode) {
      const mockToken: LinkedInTokenData = {
        accessToken: `mock_access_token_${Date.now()}`,
        expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days
        memberUrn: 'urn:li:person:mock_birendra_mishra',
        memberName: 'Birendra Mishra (Simulated)',
      };
      await this.setStoredToken(mockToken);
      return mockToken;
    }

    try {
      const tokenRes = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const { access_token, expires_in, refresh_token } = tokenRes.data;

      // Fetch user profile info
      let memberUrn = '';
      let memberName = 'Birendra Mishra';

      try {
        const userinfoRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (userinfoRes.data) {
          memberUrn = `urn:li:person:${userinfoRes.data.sub}`;
          memberName = userinfoRes.data.name || `${userinfoRes.data.given_name} ${userinfoRes.data.family_name}`;
        }
      } catch (err: any) {
        strapi.log.warn(`[LinkedIn Userinfo Warning]: ${err.message}`);
      }

      const tokenData: LinkedInTokenData = {
        accessToken: access_token,
        expiresAt: Date.now() + (expires_in || 5184000) * 1000,
        refreshToken: refresh_token,
        memberUrn,
        memberName,
      };

      await this.setStoredToken(tokenData);
      return tokenData;
    } catch (err: any) {
      strapi.log.error(`[LinkedIn OAuth Error]: ${err.response?.data?.error_description || err.message}`);
      throw new Error(`LinkedIn OAuth exchange failed: ${err.message}`);
    }
  },

  async getConnectionStatus() {
    const config = this.getClientConfig();
    const token = await this.getStoredToken();

    if (!token || !token.accessToken) {
      return {
        connected: false,
        isMockMode: config.isMockMode,
        message: config.isMockMode
          ? 'LinkedIn API credentials not yet supplied; running in Sandbox / Mock Mode.'
          : 'LinkedIn not connected.',
      };
    }

    const isExpired = Date.now() > token.expiresAt;
    return {
      connected: !isExpired,
      isExpired,
      isMockMode: config.isMockMode,
      memberName: token.memberName,
      memberUrn: token.memberUrn,
      expiresAt: new Date(token.expiresAt).toISOString(),
    };
  },

  async disconnect() {
    await this.setStoredToken(null);
    return { success: true };
  },

  async publishPost({
    articleId,
    caption,
    articleUrl,
    imageUrl,
  }: {
    articleId?: number;
    caption: string;
    articleUrl?: string;
    imageUrl?: string;
  }) {
    const config = this.getClientConfig();
    const token = await this.getStoredToken();

    if (!config.isMockMode && (!token || Date.now() > token.expiresAt)) {
      throw new Error('LinkedIn account not connected or authorization token expired.');
    }

    let postUrl = '';
    let postId = '';

    if (config.isMockMode) {
      postId = `urn:li:share:mock-${Date.now()}`;
      postUrl = `https://www.linkedin.com/feed/update/${postId}/`;
      strapi.log.info(`[LinkedIn Mock Publish]: Published simulated post ${postId}`);
    } else {
      // Official LinkedIn REST Posts API
      try {
        const payload: any = {
          author: token?.memberUrn,
          commentary: caption,
          visibility: 'PUBLIC',
          distribution: {
            feedDistribution: 'MAIN_FEED',
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
          lifecycleState: 'PUBLISHED',
          isReshareDisabledByAuthor: false,
        };

        if (articleUrl) {
          payload.content = {
            article: {
              source: articleUrl,
              title: caption.slice(0, 80),
              description: caption.slice(0, 200),
            },
          };
        }

        const res = await axios.post('https://api.linkedin.com/rest/posts', payload, {
          headers: {
            Authorization: `Bearer ${token?.accessToken}`,
            'LinkedIn-Version': '202401',
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
          },
        });

        postId = res.headers['x-restli-id'] || res.data?.id || `urn:li:share:${Date.now()}`;
        postUrl = `https://www.linkedin.com/feed/update/${postId}/`;
      } catch (err: any) {
        const errorDetail = err.response?.data?.message || err.message;
        strapi.log.error(`[LinkedIn REST API Error]: ${errorDetail}`);
        throw new Error(`LinkedIn API rejected post: ${errorDetail}`);
      }
    }

    // Update article if articleId was provided
    if (articleId) {
      try {
        await strapi.entityService.update('api::article.article', articleId, {
          data: {
            linkedInPublishStatus: 'published',
            linkedInPostUrl: postUrl,
            linkedInPostId: postId,
            linkedInErrorMessage: null,
          },
        });
      } catch (e: any) {
        strapi.log.warn(`Could not update article ${articleId}: ${e.message}`);
      }
    }

    return {
      success: true,
      postId,
      postUrl,
    };
  },

  async processScheduledQueue() {
    const now = new Date();
    try {
      const scheduledArticles = await strapi.entityService.findMany('api::article.article', {
        filters: {
          linkedInPublishStatus: 'scheduled',
          scheduledPublishAt: {
            $lte: now.toISOString(),
          },
        },
      });

      if (!Array.isArray(scheduledArticles) || scheduledArticles.length === 0) {
        return;
      }

      strapi.log.info(`[LinkedIn Queue]: Processing ${scheduledArticles.length} scheduled posts...`);

      for (const article of scheduledArticles) {
        try {
          await strapi.entityService.update('api::article.article', article.id, {
            data: { linkedInPublishStatus: 'processing' },
          });

          const caption =
            article.linkedInCaption ||
            `${article.title}\n\n${article.excerpt || article.shortDescription || ''}\n\nRead the full strategic analysis: https://birendramishra.com/insights/${article.slug}`;

          const result = await this.publishPost({
            articleId: article.id,
            caption,
            articleUrl: `https://birendramishra.com/insights/${article.slug}`,
          });

          strapi.log.info(`[LinkedIn Queue]: Published article ${article.id} -> ${result.postUrl}`);
        } catch (postError: any) {
          strapi.log.error(`[LinkedIn Queue Failure on Article ${article.id}]: ${postError.message}`);
          await strapi.entityService.update('api::article.article', article.id, {
            data: {
              linkedInPublishStatus: 'failed',
              linkedInErrorMessage: postError.message,
            },
          });
        }
      }
    } catch (err: any) {
      strapi.log.error(`[LinkedIn Queue Error]: ${err.message}`);
    }
  },
});

