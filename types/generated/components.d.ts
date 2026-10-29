import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsAbout extends Struct.ComponentSchema {
  collectionName: 'components_sections_about';
  info: {
    description: 'About heading, subtitle, narrative paragraphs, three highlights, engagement text, and benefit rows.';
    displayName: 'About section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
    primaryButtonText: Schema.Attribute.String;
    primaryButtonUrl: Schema.Attribute.String;
    secondaryButtonText: Schema.Attribute.String;
    secondaryButtonUrl: Schema.Attribute.String;
  };
}

export interface SectionsApproach extends Struct.ComponentSchema {
  collectionName: 'components_sections_approaches';
  info: {
    displayName: 'Approach section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
  };
}

export interface SectionsContact extends Struct.ComponentSchema {
  collectionName: 'components_sections_contacts';
  info: {
    displayName: 'Contact section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
    primaryButtonText: Schema.Attribute.String;
  };
}

export interface SectionsExpertise extends Struct.ComponentSchema {
  collectionName: 'components_sections_expertise';
  info: {
    displayName: 'Expertise section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
  };
}

export interface SectionsFaq extends Struct.ComponentSchema {
  collectionName: 'components_sections_faqs';
  info: {
    displayName: 'FAQ section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'Hero section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
    primaryButtonText: Schema.Attribute.String;
    primaryButtonUrl: Schema.Attribute.String;
    secondaryButtonText: Schema.Attribute.String;
    secondaryButtonUrl: Schema.Attribute.String;
  };
}

export interface SectionsInsights extends Struct.ComponentSchema {
  collectionName: 'components_sections_insights';
  info: {
    displayName: 'Insights section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
    primaryButtonText: Schema.Attribute.String;
    primaryButtonUrl: Schema.Attribute.String;
  };
}

export interface SectionsPhilosophy extends Struct.ComponentSchema {
  collectionName: 'components_sections_philosophy';
  info: {
    displayName: 'Philosophy section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
  };
}

export interface SectionsPillars extends Struct.ComponentSchema {
  collectionName: 'components_sections_pillars';
  info: {
    displayName: 'Pillars section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
  };
}

export interface SectionsPricing extends Struct.ComponentSchema {
  collectionName: 'components_sections_pricings';
  info: {
    description: 'Homepage and booking page pricing headings, introduction, disclaimer, and consultation cards.';
    displayName: 'Pricing section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    disclaimer: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
  };
}

export interface SectionsServices extends Struct.ComponentSchema {
  collectionName: 'components_sections_services';
  info: {
    displayName: 'Services section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'shared.item', true>;
    primaryButtonText: Schema.Attribute.String;
    primaryButtonUrl: Schema.Attribute.String;
    secondaryButtonText: Schema.Attribute.String;
    secondaryButtonUrl: Schema.Attribute.String;
  };
}

export interface SharedItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_items';
  info: {
    description: 'Reusable item for a card, FAQ, about highlight, link, or consultation. Fill only fields used by that section.';
    displayName: 'Section item';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    bookable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    buttonText: Schema.Attribute.String;
    buttonUrl: Schema.Attribute.String;
    colour: Schema.Attribute.String;
    consultationId: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    durationMinutes: Schema.Attribute.Integer;
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    fee: Schema.Attribute.Decimal;
    feeLabel: Schema.Attribute.String;
    label: Schema.Attribute.String;
    number: Schema.Attribute.String;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    paymentLink: Schema.Attribute.String;
    slug: Schema.Attribute.UID<'title'>;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO metadata';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    jsonLd: Schema.Attribute.JSON;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ogDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImageUrl: Schema.Attribute.String;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 95;
      }>;
    twitterCard: Schema.Attribute.Enumeration<
      ['summary', 'summary_large_image']
    > &
      Schema.Attribute.DefaultTo<'summary_large_image'>;
  };
}

export interface SharedSiteChrome extends Struct.ComponentSchema {
  collectionName: 'components_shared_site_chromes';
  info: {
    displayName: 'Site header and footer';
  };
  attributes: {
    brandName: Schema.Attribute.String;
    copyrightText: Schema.Attribute.String;
    exploreLinks: Schema.Attribute.Component<'shared.item', true>;
    footerEmail: Schema.Attribute.Email;
    footerIntro: Schema.Attribute.Text;
    footerTagline: Schema.Attribute.String;
    headerLinks: Schema.Attribute.Component<'shared.item', true>;
    legalLinks: Schema.Attribute.Component<'shared.item', true>;
    tagline: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'sections.about': SectionsAbout;
      'sections.approach': SectionsApproach;
      'sections.contact': SectionsContact;
      'sections.expertise': SectionsExpertise;
      'sections.faq': SectionsFaq;
      'sections.hero': SectionsHero;
      'sections.insights': SectionsInsights;
      'sections.philosophy': SectionsPhilosophy;
      'sections.pillars': SectionsPillars;
      'sections.pricing': SectionsPricing;
      'sections.services': SectionsServices;
      'shared.item': SharedItem;
      'shared.seo': SharedSeo;
      'shared.site-chrome': SharedSiteChrome;
    }
  }
}
