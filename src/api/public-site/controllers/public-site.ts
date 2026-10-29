declare const strapi: any;

const homepageUid = 'api::homepage.homepage';
const pageUid = 'api::page.page';
const homepageSections = ['hero', 'pillars', 'about', 'expertise', 'services', 'philosophy', 'pricing', 'approach', 'insights', 'faq', 'contact'];

const homepagePopulate = {
  siteChrome: { populate: '*' },
  seo: true,
  ...Object.fromEntries(homepageSections.map((name) => [name, { populate: '*' }])),
};
const pagePopulate = {
  seo: true,
  ...Object.fromEntries(['about', 'contact', 'faq', 'pricing'].map((name) => [name, { populate: '*' }])),
};

function publicItem(item) {
  return {
    title: item.title, number: item.number, buttonText: item.buttonText, buttonUrl: item.buttonUrl,
    description: item.description, body: item.body, label: item.label, value: item.value,
    url: item.url, slug: item.slug, order: item.order, featured: item.featured,
    consultationId: item.consultationId, durationMinutes: item.durationMinutes, fee: item.fee,
    feeLabel: item.feeLabel, bookable: item.bookable, paymentLink: item.paymentLink, colour: item.colour,
  };
}

function publicSection(section, name) {
  if (!section) return null;
  const disclaimer = section.disclaimer || '';
  const publicDisclaimer = /placeholder fees|apps script\s+config|stripe\s*\/\s*paypal/i.test(disclaimer) ? null : disclaimer;
  return {
    __component: `sections.${name}`, eyebrow: section.eyebrow, heading: section.heading,
    description: section.description, disclaimer: publicDisclaimer, body: section.body,
    primaryButtonText: section.primaryButtonText, primaryButtonUrl: section.primaryButtonUrl,
    secondaryButtonText: section.secondaryButtonText, secondaryButtonUrl: section.secondaryButtonUrl,
    items: Array.isArray(section.items) ? section.items.map(publicItem) : [],
  };
}

function publicSeo(seo) {
  if (!seo) return null;
  return {
    metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, canonicalUrl: seo.canonicalUrl,
    noIndex: seo.noIndex, ogTitle: seo.ogTitle, ogDescription: seo.ogDescription,
    ogImageUrl: seo.ogImageUrl, twitterCard: seo.twitterCard, jsonLd: seo.jsonLd,
  };
}

export default {
  async homepage(ctx) {
    const entry = await strapi.documents(homepageUid).findFirst({ status: 'published', populate: homepagePopulate });
    if (!entry) return ctx.notFound('Published homepage content is not available');
    const links = (value) => Array.isArray(value) ? value.map(publicItem) : [];
    ctx.body = {
      data: {
        siteName: entry.siteName,
        siteChrome: entry.siteChrome ? {
          brandName: entry.siteChrome.brandName, tagline: entry.siteChrome.tagline,
          headerLinks: links(entry.siteChrome.headerLinks), footerIntro: entry.siteChrome.footerIntro,
          footerEmail: entry.siteChrome.footerEmail, exploreLinks: links(entry.siteChrome.exploreLinks),
          legalLinks: links(entry.siteChrome.legalLinks), footerTagline: entry.siteChrome.footerTagline,
          copyrightText: entry.siteChrome.copyrightText,
        } : null,
        ...Object.fromEntries(homepageSections.map((name) => [name, publicSection(entry[name], name)])),
        seo: publicSeo(entry.seo),
      },
    };
  },

  async page(ctx) {
    const slug = String(ctx.params.slug || '');
    if (!['privacy', 'terms', 'book', 'manage', '404'].includes(slug)) return ctx.notFound();
    const entry = await strapi.documents(pageUid).findFirst({ filters: { slug }, status: 'published', populate: pagePopulate });
    if (!entry) return ctx.notFound('Published page content is not available');
    ctx.body = {
      data: {
        title: entry.title, slug: entry.slug,
        ...Object.fromEntries(['about', 'contact', 'faq', 'pricing'].map((name) => [name, publicSection(entry[name], name)])),
        seo: publicSeo(entry.seo),
      },
    };
  },
};
