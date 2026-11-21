import axios from 'axios';
import fs from 'fs';
import path from 'path';

export interface LinkedInTokenData {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
  memberUrn?: string;
  memberName?: string;
}

/**
 * Normalizes any text/tag into a clean, professional CamelCase hashtag.
 * e.g. "Oil & Gas" -> "OilAndGas", "power-sector" -> "PowerSector", "RACIE" -> "RACIE"
 */
function cleanToHashtag(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let str = input.trim();
  if (str.startsWith('#')) str = str.slice(1).trim();

  // Replace '&' with 'And'
  str = str.replace(/&/g, 'And');

  // Replace separators with spaces
  str = str.replace(/[-_/\\]+/g, ' ');

  const words = str.split(/\s+/).filter(Boolean);
  const formatted = words
    .map((w) => {
      const cleanWord = w.replace(/[^a-zA-Z0-9]/g, '');
      if (!cleanWord) return '';
      // Preserve acronyms like RACIE, CEO, DACI, RAPID
      if (cleanWord.length > 1 && cleanWord === cleanWord.toUpperCase()) {
        return cleanWord;
      }
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
    })
    .join('');

  return formatted;
}

/**
 * Intelligently generates relevant executive hashtags from article tags, category, SEO keywords, and brand defaults.
 */
function generateHashtags(article: any): string[] {
  if (!article) return ['#theEnergyPerspective', '#Leadership', '#CorporateFinance', '#Strategy'];

  const tagSet = new Set<string>();

  // 0. Custom LinkedIn Hashtags field if entered in Strapi
  if (article.linkedInHashtags && typeof article.linkedInHashtags === 'string') {
    const customTags = article.linkedInHashtags.split(/[\s,;]+/).filter(Boolean);
    for (const ct of customTags) {
      const cleaned = cleanToHashtag(ct);
      if (cleaned) tagSet.add(cleaned);
    }
  }

  // 1. Article tags relation
  if (Array.isArray(article.tags)) {
    for (const tag of article.tags) {
      const name = typeof tag === 'string' ? tag : tag?.name || tag?.slug;
      if (name) {
        const cleaned = cleanToHashtag(name);
        if (cleaned) tagSet.add(cleaned);
      }
    }
  }

  // 2. Article category relation
  if (article.category) {
    const catName =
      typeof article.category === 'string'
        ? article.category
        : article.category?.name || article.category?.slug;
    if (catName) {
      const cleaned = cleanToHashtag(catName);
      if (cleaned) tagSet.add(cleaned);
    }
  }

  // 3. SEO Keywords
  if (article.seoKeywords && typeof article.seoKeywords === 'string') {
    const kwList = article.seoKeywords.split(/[,;\n]+/).map((k: string) => k.trim()).filter(Boolean);
    for (const kw of kwList) {
      const cleaned = cleanToHashtag(kw);
      if (cleaned) tagSet.add(cleaned);
    }
  }

  // 4. Executive signature brand hashtags
  const brandDefaults = ['theEnergyPerspective', 'Leadership', 'Strategy', 'CorporateFinance'];
  for (const b of brandDefaults) {
    tagSet.add(b);
  }

  return Array.from(tagSet)
    .slice(0, 8)
    .map((t) => `#${t}`);
}

/**
 * Appends generated hashtags to caption without duplicating any existing ones.
 */
function mergeHashtagsIntoCaption(caption: string, hashtags: string[]): string {
  if (!hashtags || hashtags.length === 0) return caption;

  const lowerCaption = caption.toLowerCase();
  const missing = hashtags.filter((ht) => !lowerCaption.includes(ht.toLowerCase()));

  if (missing.length === 0) {
    return caption;
  }

  return `${caption.trim()}\n\n${missing.join(' ')}`;
}

export default ({ strapi }: { strapi: any }) => ({
  getClientConfig() {
    return {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      redirectUri:
        process.env.LINKEDIN_REDIRECT_URI || 'https://admin.birendramishra.com/api/linkedin/callback',
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

  /**
   * Uploads an image binary to LinkedIn REST Images API and returns the image URN (urn:li:image:...)
   */
  async uploadImageToLinkedIn(imageUrlOrPath: string, token: LinkedInTokenData): Promise<string | null> {
    if (!imageUrlOrPath || !token?.accessToken || !token?.memberUrn) {
      return null;
    }

    try {
      let imageBuffer: Buffer | null = null;
      let mimeType = 'image/jpeg';

      const cleanPath = imageUrlOrPath.split('?')[0];
      const ext = path.extname(cleanPath).toLowerCase();
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/jpeg';
      else if (ext === '.gif') mimeType = 'image/gif';
      else mimeType = 'image/jpeg';

      // 1. Try reading from local disk if stored locally
      const publicDir = strapi.dirs?.static?.public || path.resolve(process.cwd(), 'public');
      const relativePart = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
      const diskPath = path.resolve(publicDir, relativePart);

      if (fs.existsSync(diskPath)) {
        imageBuffer = await fs.promises.readFile(diskPath);
        strapi.log.info(`[LinkedIn Image Upload]: Loaded image from disk: ${diskPath} (${imageBuffer.length} bytes)`);
      } else {
        // 2. Fetch via HTTP/HTTPS
        const fetchUrl = imageUrlOrPath.startsWith('http')
          ? imageUrlOrPath
          : `https://admin.birendramishra.com${imageUrlOrPath.startsWith('/') ? '' : '/'}${imageUrlOrPath}`;

        strapi.log.info(`[LinkedIn Image Upload]: Fetching image from URL: ${fetchUrl}`);
        const imgRes = await axios.get(fetchUrl, {
          responseType: 'arraybuffer',
          timeout: 25000,
          headers: { 'User-Agent': 'BirendraMishra-CMS/1.0' },
        });
        imageBuffer = Buffer.from(imgRes.data);
        const ct = String(imgRes.headers['content-type'] || '');
        if (ct) {
          mimeType = ct.split(';')[0].trim();
        }
      }

      if (!imageBuffer || imageBuffer.length === 0) {
        strapi.log.warn(`[LinkedIn Image Upload]: Image buffer is empty for ${imageUrlOrPath}`);
        return null;
      }

      // 3. Initialize upload on LinkedIn Images API
      const candidateVersions = [
        process.env.LINKEDIN_API_VERSION,
        '202501',
        '202506',
        '202511',
        '202512',
        '202601',
        '202604',
      ].filter(Boolean) as string[];

      let initRes: any = null;
      let lastInitErr: any = null;

      for (const version of candidateVersions) {
        try {
          initRes = await axios.post(
            'https://api.linkedin.com/rest/images?action=initializeUpload',
            {
              initializeUploadRequest: {
                owner: token.memberUrn,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
                'LinkedIn-Version': version,
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json',
              },
            }
          );
          strapi.log.info(`[LinkedIn Images API]: Initialized upload using version ${version}`);
          break;
        } catch (err: any) {
          lastInitErr = err;
          const msg = err.response?.data?.message || err.message || '';
          if (msg.includes('not active') || err.response?.status === 426) {
            continue;
          }
          throw err;
        }
      }

      if (!initRes || !initRes.data?.value) {
        strapi.log.warn(`[LinkedIn Images API]: Initialize upload failed: ${lastInitErr?.message}`);
        return null;
      }

      const { uploadUrl, image: imageUrn } = initRes.data.value;
      if (!uploadUrl || !imageUrn) {
        strapi.log.warn('[LinkedIn Images API]: Missing uploadUrl or image URN in response');
        return null;
      }

      // 4. PUT binary data to uploadUrl
      await axios.put(uploadUrl, imageBuffer, {
        headers: {
          'Content-Type': mimeType,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 30000,
      });

      strapi.log.info(`[LinkedIn Image Upload Success]: Uploaded image banner with URN ${imageUrn}`);
      return imageUrn;
    } catch (err: any) {
      strapi.log.error(`[LinkedIn Image Upload Error]: ${err.response?.data?.message || err.message}`);
      return null;
    }
  },

  async publishPost({
    articleId,
    caption,
    articleUrl,
    imageUrl,
  }: {
    articleId?: number | string;
    caption?: string;
    articleUrl?: string;
    imageUrl?: string;
  }) {
    const config = this.getClientConfig();
    const token = await this.getStoredToken();

    if (!config.isMockMode && (!token || Date.now() > token.expiresAt)) {
      const err = new Error('LinkedIn account not connected or authorization token expired.');
      if (articleId) {
        try {
          await strapi.db.query('api::article.article').update({
            where: typeof articleId === 'number' ? { id: articleId } : { documentId: articleId },
            data: {
              linkedInPublishStatus: 'failed',
              linkedInErrorMessage: err.message,
            },
          });
        } catch {}
      }
      throw err;
    }

    // 1. Fetch complete article with relations if articleId is provided
    let articleData: any = null;
    if (articleId) {
      try {
        articleData = await strapi.db.query('api::article.article').findOne({
          where: typeof articleId === 'number' ? { id: articleId } : { documentId: articleId },
          populate: ['featuredImage', 'openGraphImage', 'thumbnailImage', 'tags', 'category'],
        });
      } catch (e: any) {
        strapi.log.warn(`[LinkedIn Service]: Could not populate article ${articleId}: ${e.message}`);
      }
    }

    // 2. Resolve Article URL and Image URL
    const finalArticleUrl =
      articleUrl ||
      (articleData?.slug ? `https://birendramishra.com/insights/${articleData.slug}` : undefined);

    let finalImageUrl = imageUrl;
    if (!finalImageUrl && articleData) {
      finalImageUrl =
        articleData.featuredImage?.url ||
        articleData.openGraphImage?.url ||
        articleData.thumbnailImage?.url;

      // If featured images are empty, fallback to first image found in article content body
      if (!finalImageUrl && articleData.content && typeof articleData.content === 'string') {
        const imgMatch = articleData.content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          finalImageUrl = imgMatch[1];
          strapi.log.info(
            `[LinkedIn Service]: Auto-detected image from article content body: ${finalImageUrl}`
          );
        }
      }
    }

    // 3. Generate Smart Executive Hashtags
    const hashtags = generateHashtags(articleData);

    // 4. Construct Post Commentary
    let baseCaption = (caption || articleData?.linkedInCaption || '').trim();
    if (!baseCaption && articleData) {
      const title = articleData.title?.trim() || '';
      const lead = (articleData.excerpt || articleData.shortDescription || articleData.seoDescription || '').trim();
      baseCaption = lead ? `${title}\n\n${lead}` : title;
    }

    if (finalArticleUrl && !baseCaption.includes(finalArticleUrl)) {
      baseCaption = `${baseCaption}\n\nRead the full strategic analysis: ${finalArticleUrl}`;
    }

    const fullCommentary = mergeHashtagsIntoCaption(baseCaption, hashtags);

    let postUrl = '';
    let postId = '';

    if (config.isMockMode) {
      postId = `urn:li:share:mock-${Date.now()}`;
      postUrl = `https://www.linkedin.com/feed/update/${postId}/`;
      strapi.log.info(
        `[LinkedIn Mock Publish]: Published simulated post ${postId} with hashtags: ${hashtags.join(' ')}`
      );
    } else {
      // Official LinkedIn REST Posts API
      try {
        // Upload image if available
        let imageUrn: string | null = null;
        if (finalImageUrl && token) {
          imageUrn = await this.uploadImageToLinkedIn(finalImageUrl, token);
        }

        const cardTitle = (articleData?.title || '').slice(0, 200).trim();
        const rawDesc = (
          articleData?.excerpt ||
          articleData?.shortDescription ||
          articleData?.seoDescription ||
          ''
        ).trim();
        const cardDescription = rawDesc ? rawDesc.slice(0, 250).trim() : undefined;

        // Build Payload
        let payload: any = {
          author: token?.memberUrn,
          commentary: fullCommentary,
          visibility: 'PUBLIC',
          distribution: {
            feedDistribution: 'MAIN_FEED',
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
          lifecycleState: 'PUBLISHED',
          isReshareDisabledByAuthor: false,
        };

        // Attach rich article preview card or media banner
        if (finalArticleUrl) {
          payload.content = {
            article: {
              source: finalArticleUrl,
              ...(cardTitle ? { title: cardTitle } : {}),
              ...(cardDescription ? { description: cardDescription } : {}),
              ...(imageUrn ? { thumbnail: imageUrn } : {}),
            },
          };
        } else if (imageUrn) {
          payload.content = {
            media: {
              id: imageUrn,
              ...(cardTitle ? { title: cardTitle } : {}),
            },
          };
        }

        const candidateVersions = [
          process.env.LINKEDIN_API_VERSION,
          '202501',
          '202506',
          '202511',
          '202512',
          '202601',
          '202604',
        ].filter(Boolean) as string[];

        let res: any = null;
        let lastErr: any = null;

        // Attempt 1: Full payload with image banner card
        for (const version of candidateVersions) {
          try {
            res = await axios.post('https://api.linkedin.com/rest/posts', payload, {
              headers: {
                Authorization: `Bearer ${token?.accessToken}`,
                'LinkedIn-Version': version,
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json',
              },
            });
            strapi.log.info(`[LinkedIn REST API]: Successfully posted to LinkedIn using version ${version}!`);
            break;
          } catch (vErr: any) {
            lastErr = vErr;
            const errMsg = vErr.response?.data?.message || vErr.message || '';
            if (errMsg.includes('not active') || vErr.response?.status === 426) {
              strapi.log.warn(`[LinkedIn API Version Notice]: Version ${version} not active, trying next...`);
              continue;
            }
            break;
          }
        }

        // Attempt 2: If thumbnail was rejected, retry article card without thumbnail
        if (!res && payload.content?.article?.thumbnail) {
          strapi.log.warn('[LinkedIn API]: Retrying post without thumbnail in article content...');
          const fallbackPayload = {
            ...payload,
            content: {
              article: {
                source: payload.content.article.source,
                ...(payload.content.article.title ? { title: payload.content.article.title } : {}),
                ...(payload.content.article.description
                  ? { description: payload.content.article.description }
                  : {}),
              },
            },
          };

          for (const version of candidateVersions) {
            try {
              res = await axios.post('https://api.linkedin.com/rest/posts', fallbackPayload, {
                headers: {
                  Authorization: `Bearer ${token?.accessToken}`,
                  'LinkedIn-Version': version,
                  'X-Restli-Protocol-Version': '2.0.0',
                  'Content-Type': 'application/json',
                },
              });
              strapi.log.info(
                `[LinkedIn REST API]: Successfully posted card without thumbnail using version ${version}!`
              );
              break;
            } catch (retryErr: any) {
              lastErr = retryErr;
              continue;
            }
          }
        }

        // Attempt 3: If article content was rejected, retry as clean commentary
        if (!res && payload.content) {
          strapi.log.warn('[LinkedIn API]: Retrying post with clean commentary fallback...');
          const textOnlyPayload = {
            ...payload,
          };
          delete textOnlyPayload.content;

          for (const version of candidateVersions) {
            try {
              res = await axios.post('https://api.linkedin.com/rest/posts', textOnlyPayload, {
                headers: {
                  Authorization: `Bearer ${token?.accessToken}`,
                  'LinkedIn-Version': version,
                  'X-Restli-Protocol-Version': '2.0.0',
                  'Content-Type': 'application/json',
                },
              });
              strapi.log.info(
                `[LinkedIn REST API]: Successfully posted commentary fallback using version ${version}!`
              );
              break;
            } catch (textErr: any) {
              lastErr = textErr;
              continue;
            }
          }
        }

        // Duplicate handling
        if (!res && lastErr) {
          const lastMsg = lastErr.response?.data?.message || lastErr.message || '';
          if (lastMsg.includes('duplicate')) {
            strapi.log.info('[LinkedIn API]: Duplicate detected. Retrying with unique timestamp marker...');
            payload.commentary = `${payload.commentary}\n\n[Re-published: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}]`;
            for (const version of candidateVersions) {
              try {
                res = await axios.post('https://api.linkedin.com/rest/posts', payload, {
                  headers: {
                    Authorization: `Bearer ${token?.accessToken}`,
                    'LinkedIn-Version': version,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Content-Type': 'application/json',
                  },
                });
                strapi.log.info(
                  `[LinkedIn REST API]: Successfully re-posted with unique marker using version ${version}!`
                );
                break;
              } catch (dupErr: any) {
                lastErr = dupErr;
                continue;
              }
            }
          }
        }

        if (!res && lastErr) {
          throw lastErr;
        }

        postId = res.headers['x-restli-id'] || res.data?.id || `urn:li:share:${Date.now()}`;
        postUrl = `https://www.linkedin.com/feed/update/${postId}/`;
      } catch (err: any) {
        const errorDetail = err.response?.data?.message || err.message;
        strapi.log.error(`[LinkedIn REST API Error]: ${errorDetail}`);
        if (articleId) {
          try {
            await strapi.db.query('api::article.article').update({
              where: typeof articleId === 'number' ? { id: articleId } : { documentId: articleId },
              data: {
                linkedInPublishStatus: 'failed',
                linkedInErrorMessage: errorDetail,
              },
            });
          } catch {}
        }
        throw new Error(`LinkedIn API rejected post: ${errorDetail}`);
      }
    }

    // Update article if articleId was provided
    if (articleId) {
      try {
        await strapi.db.query('api::article.article').update({
          where: typeof articleId === 'number' ? { id: articleId } : { documentId: articleId },
          data: {
            postToLinkedIn: false,
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
      const scheduledArticles = await strapi.db.query('api::article.article').findMany({
        where: {
          linkedInPublishStatus: 'scheduled',
          scheduledPublishAt: {
            $lte: now.toISOString(),
          },
        },
        populate: ['featuredImage', 'openGraphImage', 'thumbnailImage', 'tags', 'category'],
      });

      if (!Array.isArray(scheduledArticles) || scheduledArticles.length === 0) {
        return;
      }

      strapi.log.info(`[LinkedIn Queue]: Processing ${scheduledArticles.length} scheduled posts...`);

      for (const article of scheduledArticles) {
        try {
          await strapi.db.query('api::article.article').update({
            where: { id: article.id },
            data: { linkedInPublishStatus: 'processing' },
          });

          const featuredImgUrl =
            article.featuredImage?.url ||
            article.openGraphImage?.url ||
            article.thumbnailImage?.url;

          const result = await this.publishPost({
            articleId: article.id,
            caption: article.linkedInCaption || '',
            articleUrl: `https://birendramishra.com/insights/${article.slug}`,
            imageUrl: featuredImgUrl,
          });

          strapi.log.info(`[LinkedIn Queue]: Published article ${article.id} -> ${result.postUrl}`);
        } catch (postError: any) {
          strapi.log.error(`[LinkedIn Queue Failure on Article ${article.id}]: ${postError.message}`);
          await strapi.db.query('api::article.article').update({
            where: { id: article.id },
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
