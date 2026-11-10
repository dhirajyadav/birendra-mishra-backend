import type { Schema, Struct } from '@strapi/strapi';

export interface ArticleBlocksCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_article_blocks_cta_buttons';
  info: {
    displayName: 'CTA Button';
    icon: 'mouse-pointer';
  };
  attributes: {
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<['primary', 'outline']> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface ArticleBlocksHeading extends Struct.ComponentSchema {
  collectionName: 'components_article_blocks_headings';
  info: {
    displayName: 'Heading';
    icon: 'heading';
  };
  attributes: {
    level: Schema.Attribute.Enumeration<['h1', 'h2', 'h3', 'h4']> &
      Schema.Attribute.DefaultTo<'h2'>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ArticleBlocksParagraph extends Struct.ComponentSchema {
  collectionName: 'components_article_blocks_paragraphs';
  info: {
    displayName: 'Paragraph';
    icon: 'align-left';
  };
  attributes: {
    content: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface ArticleBlocksQuote extends Struct.ComponentSchema {
  collectionName: 'components_article_blocks_quotes';
  info: {
    displayName: 'Quote';
    icon: 'quote-right';
  };
  attributes: {
    author: Schema.Attribute.String;
    cite: Schema.Attribute.String;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface PageSectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_page_sections_heroes';
  info: {
    displayName: 'Hero Section';
    icon: 'layout';
  };
  attributes: {
    coreValue: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Upstream Oil&Gas Finance, M&A and Capital Governance'>;
    ctaText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Explore advisory'>;
    ctaUrl: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#solutions'>;
    description: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Strategic financial leadership for complex decisions, international growth and enduring enterprise value.'>;
    discretionValue: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Board-level confidentiality'>;
    engagementValue: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Selective Advisory & Board'>;
    experienceValue: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'20+ years international'>;
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Strategic Financial Leadership'>;
    focusValue: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Global Financial Strategy'>;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Clarity for your next chapter.'>;
  };
}

export interface SectionsAdvisory extends Struct.ComponentSchema {
  collectionName: 'components_sections_advisories';
  info: {
    displayName: 'Advisory Section';
    icon: 'briefcase';
  };
  attributes: {
    callout: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Strategic advice should improve the quality of the decision, not add another layer of process.'>;
    ctaText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Start a conversation'>;
    ctaUrl: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#contact'>;
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Selective Advisory'>;
    introText: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Designed for organisations and leadership teams seeking an experienced external perspective rather than off-the-shelf consulting packages.'>;
    items: Schema.Attribute.Component<'shared.advisory-item', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Experience applied to complex decisions.'>;
  };
}

export interface SectionsAspiration extends Struct.ComponentSchema {
  collectionName: 'components_sections_aspirations';
  info: {
    displayName: 'Aspiration Section';
    icon: 'star';
  };
  attributes: {
    eyebrow: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Aspiration'>;
    pillars: Schema.Attribute.Component<'shared.aspiration-pillar', true>;
    quote: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'\u201CFinancial leadership is not merely the recording of the past\u2014it is the strategic design of the future. Ethical financial growth and inclusion, supported by innovation for the human species. In an era accelerated by artificial intelligence and geopolitical realignments, our aspiration is to equip visionary enterprises with resilient capital frameworks, institutional agility, and decisive clarity.\u201D'>;
  };
}

export interface SectionsCapabilities extends Struct.ComponentSchema {
  collectionName: 'components_sections_capabilities';
  info: {
    displayName: 'Capabilities Section';
    icon: 'cog';
  };
  attributes: {
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Capabilities'>;
    lead: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Specialised capabilities designed for complex international enterprises, and growth organisations navigating pivotal financial decisions.'>;
    pillars: Schema.Attribute.Component<'shared.capability-pillar', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Four strategic pillars where experience meets judgement.'>;
  };
}

export interface SectionsContact extends Struct.ComponentSchema {
  collectionName: 'components_sections_contacts';
  info: {
    displayName: 'Contact Section';
    icon: 'mail';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Open to conversations around strategic advisory, board and executive opportunities, corporate finance, and selected collaborations. Share a short note about the context and the discussion you have in mind.'>;
    execName: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Birendra Mishra'>;
    execRole: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Senior Executive | Global Financial Strategy, M&A and Capital Governance'>;
    eyebrow: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Connect'>;
    formDisclaimer: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'This prototype opens your email client; it does not transmit data to a server.'>;
    formEmailLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Email'>;
    formEmailPlaceholder: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'you@company.com'>;
    formMessageLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Message'>;
    formMessagePlaceholder: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Briefly describe the opportunity or discussion.'>;
    formNameLabel: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Name'>;
    formNamePlaceholder: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Your name'>;
    formSubmitText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Send confidential enquiry'>;
    formTypeLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Enquiry Type'>;
    linkedinBadgeText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Connect on LinkedIn'>;
    linkedinUrl: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'https://www.linkedin.com/'>;
    titleKicker: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Let\u2019s turn complexity into opportunity'>;
    titleMain: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Confidential\nconversations.'>;
  };
}

export interface SectionsFaq extends Struct.ComponentSchema {
  collectionName: 'components_sections_faqs';
  info: {
    displayName: 'FAQ Section';
    icon: 'question';
  };
  attributes: {
    eyebrow: Schema.Attribute.String & Schema.Attribute.DefaultTo<'FAQ'>;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Common questions'>;
    isVisible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    items: Schema.Attribute.Component<'shared.faq-item', true>;
    subhead: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Practical details regarding consultation scheduling, confidential discussions, and advisory arrangements.'>;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'Hero Section';
    icon: 'layout';
  };
  attributes: {
    coreLabel: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Core'>;
    coreValue: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Upstream Oil&Gas Finance,\nM&A and Capital Governance'>;
    ctaText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Explore advisory'>;
    ctaUrl: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#solutions'>;
    description: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Strategic financial leadership for complex decisions, international growth and enduring enterprise value.'>;
    discretionLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Discretion'>;
    discretionValue: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Board-level confidentiality'>;
    engagementLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Engagement'>;
    engagementValue: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Selective Advisory & Board'>;
    experienceLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Experience'>;
    experienceValue: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'20+ years international'>;
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Strategic Financial Leadership'>;
    focusLabel: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Focus'>;
    focusValue: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Global Financial Strategy'>;
    titleHighlight: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'chapter.'>;
    titlePrefix: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Clarity for your next'>;
    trustItems: Schema.Attribute.Component<'shared.text-item', true>;
  };
}

export interface SectionsInsights extends Struct.ComponentSchema {
  collectionName: 'components_sections_insights';
  info: {
    displayName: 'Insights Section';
    icon: 'newspaper';
  };
  attributes: {
    eyebrow: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Insights'>;
    fallbackCards: Schema.Attribute.Component<'shared.insight-card', true>;
    heading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'The Energy Perspective and Financial strategy'>;
    lead: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Markets, geopolitics, energy transition and technology matter because of what they mean for capital allocation, financial performance, risk and long-term enterprise value.'>;
    linkedinBtnText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'LinkedIn profile'>;
    linkedinBtnUrl: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'https://www.linkedin.com/'>;
    metaNote: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Articles published on LinkedIn, alongside future writing on corporate finance, M&A, FP&A, capital governance and international leadership.'>;
    subheading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Understanding the business behind the energy headlines.'>;
  };
}

export interface SectionsMeetBirendra extends Struct.ComponentSchema {
  collectionName: 'components_sections_meet_birendras';
  info: {
    displayName: 'Meet Birendra Section';
    icon: 'user';
  };
  attributes: {
    bioParagraph1: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Over more than two decades in international finance and the energy sector, I have built experience across corporate headquarters and complex international operations, with assignments spanning India, Nigeria, Italy, Kenya, South Africa and Iraq.'>;
    bioParagraph2: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'My career has encompassed financial leadership, corporate reporting, planning and performance management, joint ventures, governance, capital allocation and transaction support across international upstream oil & gas operations.'>;
    bioParagraph3: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Working across different countries, cultures and organisational settings has taught me to connect corporate strategy with operational realities while maintaining financial discipline and effective governance. Today, that experience shapes how I approach M&A, capital allocation, financial strategy, risk and controls, technology-enabled finance and enterprise performance.'>;
    capabilitiesHeading: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Strategic Capabilities & Value to Organisation'>;
    capabilitiesLead: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'I collaborate closely with executive leadership to craft proactive financial frameworks, moving beyond simple financial reporting to accelerate business planning, sustainable expansion, manage international exposure, and maximise the enterprise value.'>;
    capabilityValueCards: Schema.Attribute.Component<
      'shared.capability-value-card',
      true
    >;
    connectCtaText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Start a conversation'>;
    connectCtaUrl: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#contact'>;
    connectDescription: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Confidential executive discussions for forward-looking enterprises and boards.'>;
    connectTitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<"Interested in exploring strategic advisory, board, or corporate finance opportunities? Let's connect.">;
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Executive Profile'>;
    metric1Label: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Years'>;
    metric1Value: Schema.Attribute.String & Schema.Attribute.DefaultTo<'20+'>;
    metric2Label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Countries'>;
    metric2Value: Schema.Attribute.String & Schema.Attribute.DefaultTo<'6'>;
    metricHighlightText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Corporate + Operations'>;
    philosophyQuote: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'\u201CEffective strategic financial leadership relies on vision. It requires building agile frameworks that allow organisations to pivot smoothly, capture emerging market opportunities, and turn complexity into a competitive advantage. Financial leadership is not about backward-looking compliance.\u201D'>;
    photo: Schema.Attribute.Media<'images'>;
    photoBadgeText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Birendra Mishra \u00B7 Senior Executive'>;
    subheadline: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Global Financial Strategy, M&A and Capital Governance'>;
    tagBadges: Schema.Attribute.Component<'shared.tag-badge', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Senior Executive.'>;
  };
}

export interface SectionsPillars extends Struct.ComponentSchema {
  collectionName: 'components_sections_pillars';
  info: {
    displayName: 'Pillars Section';
    icon: 'layer';
  };
  attributes: {
    items: Schema.Attribute.Component<'shared.pillar-item', true>;
  };
}

export interface SectionsPurposeMissionValues extends Struct.ComponentSchema {
  collectionName: 'components_sections_purpose_mission_values';
  info: {
    displayName: 'Purpose Mission Values Section';
    icon: 'heart';
  };
  attributes: {
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Strategic Foundations'>;
    lead: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'A clear set of principles for how financial leadership, judgement and professional responsibility should be exercised.'>;
    missionDescription: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'To support organisations in making distinctive, lasting and significant improvements in their overall performance.'>;
    missionNumber: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'02 / MISSION'>;
    missionTitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Distinctive, lasting improvement'>;
    purposeDescription: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'To help create positive, enduring change in the world.'>;
    purposeNumber: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'01 / PURPOSE'>;
    purposeTitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Positive, enduring change'>;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Purpose, Mission & Values'>;
    valuesDescription: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<"Adhere to the highest professional and ethical standards; put organisations' interests ahead; preserve confidence and trust; maintain an independent perspective; and manage resources in an optimised, cost-effective manner.">;
    valuesNumber: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'03 / VALUES'>;
    valuesTitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Professional standards & independence'>;
  };
}

export interface SharedAdvisoryItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_advisory_items';
  info: {
    displayName: 'Advisory Item';
    icon: 'briefcase';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedAspirationPillar extends Struct.ComponentSchema {
  collectionName: 'components_shared_aspiration_pillars';
  info: {
    displayName: 'Aspiration Pillar';
    icon: 'sparkles';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    number: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedCapabilityPillar extends Struct.ComponentSchema {
  collectionName: 'components_shared_capability_pillars';
  info: {
    displayName: 'Capability Pillar';
    icon: 'shield';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    pillarNumber: Schema.Attribute.String & Schema.Attribute.Required;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    subbox1Description: Schema.Attribute.Text & Schema.Attribute.Required;
    subbox1Title: Schema.Attribute.String & Schema.Attribute.Required;
    subbox2Description: Schema.Attribute.Text & Schema.Attribute.Required;
    subbox2Title: Schema.Attribute.String & Schema.Attribute.Required;
    tag: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    watermark: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedCapabilityValueCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_capability_value_cards';
  info: {
    displayName: 'Capability Value Card';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedInsightCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_insight_cards';
  info: {
    displayName: 'Insight Card';
    icon: 'file';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    linkLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Read on LinkedIn'>;
    linkUrl: Schema.Attribute.String & Schema.Attribute.Required;
    tag: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedPillarItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_pillar_items';
  info: {
    displayName: 'Pillar Item';
    icon: 'layer';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    number: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTagBadge extends Struct.ComponentSchema {
  collectionName: 'components_shared_tag_badges';
  info: {
    displayName: 'Tag Badge';
    icon: 'priceTag';
  };
  attributes: {
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTextItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_text_items';
  info: {
    displayName: 'Text Item';
    icon: 'bulletList';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'article-blocks.cta-button': ArticleBlocksCtaButton;
      'article-blocks.heading': ArticleBlocksHeading;
      'article-blocks.paragraph': ArticleBlocksParagraph;
      'article-blocks.quote': ArticleBlocksQuote;
      'page-sections.hero': PageSectionsHero;
      'sections.advisory': SectionsAdvisory;
      'sections.aspiration': SectionsAspiration;
      'sections.capabilities': SectionsCapabilities;
      'sections.contact': SectionsContact;
      'sections.faq': SectionsFaq;
      'sections.hero': SectionsHero;
      'sections.insights': SectionsInsights;
      'sections.meet-birendra': SectionsMeetBirendra;
      'sections.pillars': SectionsPillars;
      'sections.purpose-mission-values': SectionsPurposeMissionValues;
      'shared.advisory-item': SharedAdvisoryItem;
      'shared.aspiration-pillar': SharedAspirationPillar;
      'shared.capability-pillar': SharedCapabilityPillar;
      'shared.capability-value-card': SharedCapabilityValueCard;
      'shared.faq-item': SharedFaqItem;
      'shared.insight-card': SharedInsightCard;
      'shared.pillar-item': SharedPillarItem;
      'shared.tag-badge': SharedTagBadge;
      'shared.text-item': SharedTextItem;
    }
  }
}
