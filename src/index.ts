export default {
  register({ strapi }: { strapi: any }) {
    // Document service middleware to automate LinkedIn publishing and scheduling
    if (strapi.documents && typeof strapi.documents.use === 'function') {
      strapi.documents.use(async (context: any, next: () => Promise<any>) => {
        const isArticle = context.uid === 'api::article.article';

        // When creating or updating an article with future schedule time
        if (isArticle && (context.action === 'create' || context.action === 'update')) {
          const data = context.params?.data;
          if (data && data.postToLinkedIn) {
            if (data.scheduledPublishAt && new Date(data.scheduledPublishAt).getTime() > Date.now()) {
              data.linkedInPublishStatus = 'scheduled';
            }
          }
        }

        const result = await next();

        // When saving (draft/published) or publishing an article
        if (isArticle && (context.action === 'publish' || context.action === 'update' || context.action === 'create')) {
          try {
            const docId = context.params?.documentId || result?.documentId;
            if (docId) {
              const article = await strapi.db.query('api::article.article').findOne({
                where: { documentId: docId },
                populate: ['featuredImage', 'openGraphImage', 'thumbnailImage', 'tags', 'category'],
              });

              if (article && article.postToLinkedIn) {
                const hasFutureSchedule =
                  article.scheduledPublishAt &&
                  new Date(article.scheduledPublishAt).getTime() > Date.now();

                if (hasFutureSchedule) {
                  // Mode B: Scheduled Time
                  await strapi.db.query('api::article.article').updateMany({
                    where: { documentId: docId },
                    data: {
                      linkedInPublishStatus: 'scheduled',
                      linkedInErrorMessage: null,
                    },
                  });
                  strapi.log.info(
                    `[LinkedIn Scheduler]: Article "${article.title}" scheduled for ${article.scheduledPublishAt}`
                  );
                } else {
                  // Mode A: Direct Publish (Immediately)
                  strapi.log.info(
                    `[LinkedIn Direct Publish]: Publishing article "${article.title}" to LinkedIn immediately...`
                  );
                  const linkedinService = strapi.service('api::linkedin.linkedin');
                  if (linkedinService) {
                    const articleUrl = `https://birendramishra.com/insights/${article.slug}`;
                    const featuredImgUrl =
                      article.featuredImage?.url ||
                      article.openGraphImage?.url ||
                      article.thumbnailImage?.url;

                    await linkedinService.publishPost({
                      articleId: article.id,
                      caption: article.linkedInCaption || '',
                      articleUrl,
                      imageUrl: featuredImgUrl,
                    });
                    strapi.log.info(
                      `[LinkedIn Direct Publish]: Successfully published article "${article.title}" to LinkedIn!`
                    );
                  }
                }
              }
            }
          } catch (postErr: any) {
            strapi.log.error(`[LinkedIn Publish Error]: ${postErr.message}`);
          }
        }

        return result;
      });
    }
  },

  async bootstrap({ strapi }: { strapi: any }) {
    try {
      // 1. Grant public permissions to view published content and submit enquiries
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        const publicPermissions = [
          'api::global.global.find',
          'api::page.page.find',
          'api::page.page.findOne',
          'api::article.article.find',
          'api::article.article.findOne',
          'api::category.category.find',
          'api::category.category.findOne',
          'api::tag.tag.find',
          'api::tag.tag.findOne',
          'api::author.author.find',
          'api::author.author.findOne',
          'api::enquiry.enquiry.create',
          'api::homepage.homepage.find',
          'api::linkedin.linkedin.getStatus',
          'api::linkedin.linkedin.getQueue',
          'api::linkedin.linkedin.getAuthUrl',
        ];

        for (const action of publicPermissions) {
          const existing = await strapi
            .query('plugin::users-permissions.permission')
            .findOne({ where: { role: publicRole.id, action } });

          if (!existing) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
          }
        }
        strapi.log.info('✓ Public API permissions successfully configured for Headless frontend.');
      }

      // 2. Seed Global Settings if empty
      const existingGlobal = await strapi.db.query('api::global.global').findOne();
      if (!existingGlobal) {
        await strapi.db.query('api::global.global').create({
          data: {
            siteName: 'Birendra Mishra',
            siteTagline: 'Strategic Financial Leadership',
            ownerName: 'Birendra Mishra',
            ownerTitle: 'Senior Executive | Global Financial Strategy, M&A and Capital Governance',
            contactEmail: 'bbm@birendramishra.com',
            linkedInUrl: 'https://www.linkedin.com/',
            xUrl: 'https://x.com/',
            substackUrl: 'https://substack.com/',
            copyrightText:
              '© Birendra Mishra. All rights reserved. Personal views expressed here are independent and do not necessarily represent those of any employer or client or others.',
            publishedAt: new Date(),
          },
        });
        strapi.log.info('✓ Global settings seeded.');
      }

      // 3. Seed Author if empty
      const authors = await strapi.db.query('api::author.author').findMany();
      let authorId: number | null = null;
      if (!authors || authors.length === 0) {
        const author = await strapi.db.query('api::author.author').create({
          data: {
            name: 'Birendra Mishra',
            role: 'Senior Executive | Global Financial Strategy, M&A and Capital Governance',
            bio: 'Over two decades across international corporate headquarters and complex upstream energy operations in India, Nigeria, Italy, Kenya, South Africa, and Iraq.',
            publishedAt: new Date(),
          },
        });
        authorId = author.id;
        strapi.log.info('✓ Author seeded.');
      } else {
        authorId = authors[0].id;
      }

      // 4. Seed Categories if empty
      const categories = await strapi.db.query('api::category.category').findMany();
      let cat1Id: number | null = null;
      let cat2Id: number | null = null;
      let cat3Id: number | null = null;

      if (!categories || categories.length === 0) {
        const c1 = await strapi.db.query('api::category.category').create({
          data: { name: 'Markets & Geopolitics', slug: 'markets-geopolitics', publishedAt: new Date() },
        });
        const c2 = await strapi.db.query('api::category.category').create({
          data: { name: 'Finance & Investment', slug: 'finance-investment', publishedAt: new Date() },
        });
        const c3 = await strapi.db.query('api::category.category').create({
          data: { name: 'Energy · Technology · Leadership', slug: 'energy-tech-leadership', publishedAt: new Date() },
        });
        cat1Id = c1.id;
        cat2Id = c2.id;
        cat3Id = c3.id;
        strapi.log.info('✓ Categories seeded.');
      }

      // Ensure Leadership category exists
      let leadershipCat = await strapi.db.query('api::category.category').findOne({ where: { slug: 'leadership' } });
      if (!leadershipCat) {
        leadershipCat = await strapi.db.query('api::category.category').create({
          data: {
            name: 'Leadership',
            slug: 'leadership',
            description: 'Strategic leadership, governance and executive management insights.',
            publishedAt: new Date(),
          },
        });
      }

      // Ensure Tags exist
      const requiredTags = [
        { name: 'Strategic Finance', slug: 'strategic-finance' },
        { name: 'Digital Transformation', slug: 'digital-transformation' },
        { name: 'Financial Leadership', slug: 'financial-leadership' },
        { name: 'Business Strategy', slug: 'business-strategy' },
        { name: 'Technology', slug: 'technology' },
      ];
      for (const t of requiredTags) {
        const existingTag = await strapi.db.query('api::tag.tag').findOne({ where: { slug: t.slug } });
        if (!existingTag) {
          await strapi.db.query('api::tag.tag').create({
            data: { ...t, publishedAt: new Date() },
          });
        }
      }

      // 5. Cleanup legacy dummy seed articles so only authentic user-created articles remain
      try {
        const dummySlugs = [
          'from-headline-to-financial-consequence',
          'capital-through-a-cfo-lens',
          'strategy-beyond-the-numbers',
          'future-of-strategic-financial-leadership',
        ];
        for (const dSlug of dummySlugs) {
          await strapi.db.query('api::article.article').deleteMany({
            where: { slug: dSlug },
          });
        }
        await strapi.db.query('api::article.article').deleteMany({
          where: { documentId: 'cn89hor982fls5pg9upp6i2y' },
        });
        strapi.log.info('✓ Legacy dummy articles cleaned up.');
      } catch (cleanErr: any) {
        strapi.log.debug(`Article cleanup notice: ${cleanErr.message}`);
      }

      

      // 6. Enforce Clean 2-Section Content Manager Layout (hide blocks)
      try {
        const key = 'plugin_content_manager_configuration_content_types::api::article.article';
        const storeSetting = await strapi.db.query('strapi::core-store').findOne({ where: { key } });
        if (storeSetting && storeSetting.value) {
          const config = JSON.parse(storeSetting.value);
          config.layouts.edit = [
            // SECTION 1: ARTICLE CONTENT & DETAILS
            [
              { name: 'title', size: 6 },
              { name: 'slug', size: 6 },
            ],
            [
              { name: 'excerpt', size: 6 },
              { name: 'shortDescription', size: 6 },
            ],
            [
              { name: 'author', size: 6 },
              { name: 'category', size: 6 },
            ],
            [
              { name: 'featuredImage', size: 6 },
              { name: 'thumbnailImage', size: 6 },
            ],
            [
              { name: 'readingTime', size: 6 },
              { name: 'featuredArticle', size: 6 },
            ],
            [
              { name: 'content', size: 12 },
            ],

            // SECTION 2: SEO SETTINGS & TAGS
            [
              { name: 'tags', size: 12 },
            ],
            [
              { name: 'seoTitle', size: 6 },
              { name: 'canonicalUrl', size: 6 },
            ],
            [
              { name: 'seoDescription', size: 12 },
            ],
            [
              { name: 'seoKeywords', size: 6 },
              { name: 'openGraphImage', size: 6 },
            ],

            // SECTION 3: LINKEDIN PUBLISHING & AUTOMATION
            [
              { name: 'postToLinkedIn', size: 6 },
              { name: 'scheduledPublishAt', size: 6 },
            ],
            [
              { name: 'linkedInPublishStatus', size: 6 },
              { name: 'linkedInPostUrl', size: 6 },
            ],
            [
              { name: 'linkedInCaption', size: 12 },
            ],
            [
              { name: 'linkedInHashtags', size: 12 },
            ],
            [
              { name: 'linkedInErrorMessage', size: 12 },
            ],
          ];

          if (!config.metadatas) config.metadatas = {};
          config.metadatas.postToLinkedIn = {
            edit: {
              label: 'Post to LinkedIn? (चेक करें)',
              description: 'Tick this box to publish to LinkedIn. If "Scheduled LinkedIn Time" is left empty, it publishes directly/immediately when saved/published. If a future time is set, it publishes automatically at that time.',
              visible: true,
              editable: true,
            },
            list: {
              label: 'LinkedIn',
              searchable: true,
              sortable: true,
            },
          };

          config.metadatas.scheduledPublishAt = {
            edit: {
              label: 'Scheduled LinkedIn Time (Optional)',
              description: 'Leave empty for Direct Publish immediately. Or pick a future date and time to publish automatically.',
              visible: true,
              editable: true,
            },
            list: {
              label: 'Scheduled For',
              searchable: true,
              sortable: true,
            },
          };

          config.metadatas.linkedInPublishStatus = {
            edit: {
              label: 'LinkedIn Publishing Status',
              description: 'Status: draft, scheduled, processing, published, or failed.',
              visible: true,
              editable: true,
            },
            list: {
              label: 'LinkedIn Status',
              searchable: true,
              sortable: true,
            },
          };

          config.metadatas.linkedInPostUrl = {
            edit: {
              label: 'Published LinkedIn Post URL',
              description: 'Direct link to the published post on LinkedIn.',
              visible: true,
              editable: false,
            },
            list: {
              label: 'LinkedIn URL',
              searchable: false,
              sortable: false,
            },
          };

          config.metadatas.linkedInCaption = {
            edit: {
              label: 'Custom LinkedIn Caption / Text (Optional)',
              description: 'Custom commentary. If left empty, automatically formats: Article Title + Excerpt + Article Link.',
              visible: true,
              editable: true,
            },
            list: {
              label: 'LinkedIn Caption',
              searchable: false,
              sortable: false,
            },
          };

          config.metadatas.linkedInHashtags = {
            edit: {
              label: 'LinkedIn #Hashtags (Optional)',
              description:
                'Custom #hashtags for LinkedIn post (e.g. #leadership #energy #powersector #RACIE #strategy). If left empty, automatically generated from article topics & keywords.',
              placeholder: '#leadership #energy #strategy #theEnergyPerspective',
              visible: true,
              editable: true,
            },
            list: {
              label: 'LinkedIn Hashtags',
              searchable: true,
              sortable: false,
            },
          };

          config.metadatas.linkedInErrorMessage = {
            edit: {
              label: 'LinkedIn Error Details (if failed)',
              description: 'Displays exact error message from LinkedIn API if publishing fails.',
              visible: true,
              editable: false,
            },
            list: {
              label: 'Error',
              searchable: false,
              sortable: false,
            },
          };
          config.metadatas.content = {
            edit: {
              label: 'Article Body (Rich Text Editor — Text, Images & Videos)',
              description: 'Write your full article here. Format text, insert media library images, embed videos, add tables, quotes, and links in one unified editor.',
              placeholder: 'Start writing your article...',
              visible: true,
              editable: true,
            },
            list: {
              label: 'Content',
              searchable: false,
              sortable: false,
            },
          };

          if (config.metadatas.blocks) {
            config.metadatas.blocks.edit = {
              ...config.metadatas.blocks.edit,
              visible: false,
            };
          }

          await strapi.db.query('strapi::core-store').update({
            where: { id: storeSetting.id },
            data: { value: JSON.stringify(config) },
          });
          strapi.log.info('✓ Content Manager Article edit view configured with 2 clean sections.');
        }
      } catch (cmErr: any) {
        strapi.log.debug(`Content Manager layout update notice: ${cmErr.message}`);
      }

      // 7. Seed/Enrich Homepage Single Type if empty or partially empty
      try {
        let existingHomepage = null;
        try {
          existingHomepage = await strapi.documents('api::homepage.homepage').findFirst({
            populate: '*',
          });
        } catch {
          existingHomepage = await strapi.entityService.findMany('api::homepage.homepage', {
            populate: '*',
          });
        }

        const initialHomepageData = require('./data/initial-homepage.json');

        if (!existingHomepage) {
          if (strapi.documents) {
            await strapi.documents('api::homepage.homepage').create({
              data: initialHomepageData,
              status: 'published',
            });
          } else {
            await strapi.entityService.create('api::homepage.homepage', {
              data: {
                ...initialHomepageData,
                publishedAt: new Date(),
              },
            });
          }
          strapi.log.info('✓ Homepage Single Type created with complete finalized content.');
        } else if (!existingHomepage.meetBirendra || !existingHomepage.advisory || !existingHomepage.capabilities) {
          strapi.log.info('Homepage exists but sections are blank. Enriching all 10 sections with initial content...');
          const docId = existingHomepage.documentId || existingHomepage.id;

          const mergedHero = {
            ...initialHomepageData.hero,
            ...(existingHomepage.hero || {}),
          };

          if (strapi.documents) {
            await strapi.documents('api::homepage.homepage').update({
              documentId: docId,
              data: {
                ...initialHomepageData,
                hero: mergedHero,
              },
              status: 'published',
            });
          } else {
            await strapi.entityService.update('api::homepage.homepage', existingHomepage.id, {
              data: {
                ...initialHomepageData,
                hero: mergedHero,
                publishedAt: new Date(),
              },
            });
          }
          strapi.log.info('✓ Homepage Single Type successfully populated with all 10 sections & SEO data!');
        }
      } catch (hpErr: any) {
        strapi.log.warn(`Homepage seeding notice: ${hpErr.message}`);
      }
    } catch (err: any) {
      strapi.log.error(`[Strapi Bootstrap Warning]: ${err.message}`);
    }
  },
};
