const expertise = [
  ['Capital Allocation & Budget Stewardship', 'Translate corporate ambitions into actionable financial frameworks, ensuring investment supports long-term strategic goals.'],
  ['Corporate Development, M&A & Integration', 'Lead financial due diligence, design effective shareholding structures and support post-merger integration to capture synergies and mitigate risk.'],
  ['Risk Mitigation & Enterprise Optimisation', 'Establish risk assessment, modern financial controls, ERP integration and continuous audit-readiness to protect capital.'],
  ['Cross-Border Leadership & Organisational Agility', 'Build high-performing multi-cultural teams able to execute across regions and regulatory regimes.'],
  ['Complex Governance & Stakeholder Alignment', 'Build trusted partnerships across joint ventures, regulatory bodies and board-level stakeholders.'],
  ['Financial Planning & Analysis (FP&A)', 'Connect financial analysis, planning and performance oversight to business strategy and disciplined execution.'],
];
const services = [
  ['M&A', 'Corporate development, due diligence, acquisition structures and integration.'],
  ['Financial Planning & Analysis', 'Planning, budgeting, performance analysis and capital deployment.'],
  ['Capital Allocation', 'Align investment priorities with strategic goals and long-term value.'],
  ['Risk & Controls', 'Risk assessment, financial controls, ERP integration and audit readiness.'],
  ['Capital Governance', 'Cross-border governance and stakeholder alignment across complex markets.'],
  ['Start with a conversation', 'Choose a discovery call or strategy session â€” slots available up to two months ahead, with Google Meet included.'],
];
const consultations = [
  { consultationId: 'discovery', title: 'Discovery Call', durationMinutes: 15, fee: 0, feeLabel: 'Complimentary', description: 'A short introductory conversation to explore fit, scope and next steps. No obligation.', bookable: true, colour: 'gold' },
  { consultationId: 'strategy-60', title: 'Strategy Consultation', durationMinutes: 60, fee: 450, feeLabel: null, description: 'Focused 60-minute session on financial strategy, capital decisions or organisational priorities.', bookable: true, colour: 'navy', featured: true },
  { consultationId: 'ma-review', title: 'M&A / Deal Review', durationMinutes: 90, fee: 750, feeLabel: null, description: 'In-depth review of an acquisition, divestiture, due-diligence findings or integration plan.', bookable: true, colour: 'ink' },
  { consultationId: 'retainer', title: 'Monthly Advisory Retainer', durationMinutes: 0, fee: null, feeLabel: 'By enquiry', description: 'Ongoing strategic advisory for executive leadership. Scoped to your needs â€” contact to discuss.', bookable: false, colour: 'accent' },
];
const pricingSection = (eyebrow: string, heading: string, description: string, disclaimer: string) => ({
  __component: 'sections.pricing', eyebrow, heading, description, disclaimer,
  items: consultations.map((consultation, order) => ({ ...consultation, order })),
});
const homepageSections = ['hero', 'pillars', 'about', 'expertise', 'services', 'philosophy', 'pricing', 'approach', 'insights', 'faq', 'contact'];
const pageSections = ['about', 'contact', 'faq', 'pricing'];
const homepagePopulate = Object.fromEntries(homepageSections.map((name) => [name, { populate: '*' }]));
const pagePopulate = Object.fromEntries(pageSections.map((name) => [name, { populate: '*' }]));

async function migrateLegacySectionLinks(strapi) {
  const tables = [
    { name: 'homepages_cmps', fields: Object.fromEntries(homepageSections.map((name) => [`sections.${name}`, name])) },
    { name: 'pages_cmps', fields: Object.fromEntries(pageSections.map((name) => [`sections.${name}`, name])) },
  ];
  for (const table of tables) {
    const rows = await strapi.db.connection(table.name).where({ field: 'sections' }).select('id', 'component_type');
    for (const row of rows) {
      const field = table.fields[row.component_type];
      if (field) await strapi.db.connection(table.name).where({ id: row.id }).update({ field, order: null });
    }
  }
}

const namedSections = (entries) => Object.fromEntries(entries.map(({ __component, ...content }) => [__component.slice('sections.'.length), content]));
const items = (rows: string[][]) => rows.map(([title, description, number], order) => ({ title, description, ...(number ? { number } : {}), order }));
const section = (eyebrow: string, heading: string, description: string, rows: string[][] = []) => ({ eyebrow, heading, description, items: items(rows) });

export async function seedFallbackContent(strapi) {
  await migrateLegacySectionLinks(strapi);
  const uid = 'api::homepage.homepage';
  const existing = await strapi.documents(uid).findFirst({ status: 'published' });
  if (existing) {
    const published = await strapi.documents(uid).findFirst({ status: 'published', populate: homepagePopulate });
    if (published && !published.pricing) {
      const { __component, ...pricing } = pricingSection('Pricing', 'Consultation packages', 'Transparent options for discovery, focused strategy work and deeper deal reviews.', '');
      await strapi.documents(uid).update({ documentId: published.documentId, status: 'published', data: { pricing } });
    }
    await strapi.documents(uid).publish({ documentId: published.documentId });

    const pageUid = 'api::page.page';
    const bookPage = await strapi.documents(pageUid).findFirst({ filters: { slug: 'book' }, status: 'published', populate: pagePopulate });
    if (bookPage && !bookPage.pricing) {
      const { __component, ...pricing } = pricingSection('Consultations', 'Choose a consultation', 'Choose a consultation that fits your priorities and schedule.', '');
      await strapi.documents(pageUid).update({ documentId: bookPage.documentId, status: 'published', data: { pricing } });
    }
    if (bookPage) await strapi.documents(pageUid).publish({ documentId: bookPage.documentId });
    return;
  }

  const document = await strapi.documents(uid).create({
    data: {
      siteName: 'Birendra Mishra',
      siteChrome: { brandName: 'Birendra Mishra', tagline: 'Strategic Financial Leadership', footerIntro: 'Independent thinking and disciplined executive guidance for complex financial decisions and enduring enterprise value.', footerEmail: 'bbm@birendramishra.com', headerLinks: items([['About', '#about'], ['Expertise', '#expertise'], ['Services', '#services'], ['Pricing', '#pricing'], ['Approach', '#approach'], ['Insights', '#insights'], ['FAQ', '#faq'], ['Contact', '#contact']]), exploreLinks: items([['Services', '#services'], ['Pricing', '#pricing'], ['Book a consultation', 'book.html'], ['Insights', '#insights'], ['FAQ', '#faq']]), legalLinks: items([['Privacy policy', 'privacy.html'], ['Terms of engagement', 'terms.html'], ['Manage booking', 'manage.html']]), footerTagline: 'Strategic advisory Â· Corporate finance Â· Governance', copyrightText: 'Birendra Mishra. All rights reserved.' },
      ...namedSections([
        { __component: 'sections.hero', ...section('Strategic Financial Leadership', 'Clarity for your next chapter.', 'Strategic financial leadership for complex decisions, international growth and enduring enterprise value.', [['Focus', 'Global Financial Strategy'], ['Core', 'M&A and Capital Governance'], ['Experience', '20+ years international'], ['Booking window', 'Up to 60 days ahead'], ['Meetings', 'Google Meet + calendar'], ['Credentials', '20+ years of international experience'], ['Perspective', 'Independent strategic perspective'], ['Advisory', 'Confidential executive advisory']]) },
        { __component: 'sections.pillars', ...section('Our principles', 'Four pillars', 'Hands-on, tailor-made advice; results-focused execution; international experience; independence and confidentiality.', [['Hands-on, tailor-made advice', 'Practical guidance shaped to your organisationâ€™s realities â€” not generic playbooks.', '01'], ['Results-focused execution', 'From framework to follow-through: plans that leadership can implement with confidence.', '02'], ['20+ years of international experience', 'Seasoned perspective across high-growth, high-risk markets and multi-cultural teams.', '03'], ['Independence & confidentiality', 'Independent thinking for board-level and executive conversations that stay private.', '04']] ) },
        { __component: 'sections.about', ...section('About', 'Senior executive. Global perspective.', 'Global Financial Strategy, M&A and Capital Governance.', [['Global Strategy', 'Long-term financial direction'], ['Capital Governance', 'Disciplined investment decisions'], ['Executive Leadership', 'Cross-border operational experience'], ['Engagement', 'Interested in strategic advisory, board, or corporate finance opportunities? Book a consultation or send a confidential enquiry.'], ['Confidential by design', 'Private, focused executive conversations.'], ['Flexible scheduling', 'Choose a suitable consultation time.'], ['Remote meetings', 'Google Meet and calendar coordination.']]), body: 'With over two decades of experience directing multi-billion-dollar international operations, I help organisations navigate complex financial landscapes, optimise capital deployment, and build resilient global governance models.\n\nHaving led multi-cultural teams across high-growth, high-risk international markets, I bridge the gap between high-level corporate vision and disciplined operational execution.' },
        { __component: 'sections.expertise', ...section('Expertise', 'Where experience meets judgement.', 'Practical financial leadership across strategy, transactions, risk and governance.', expertise) },
        { __component: 'sections.services', ...section('Services', 'Strategic services built around your goals.', 'Focused support for complex financial and organisational priorities.', services) },
        { __component: 'sections.philosophy', ...section('My philosophy', 'Financial leadership is not just about looking back. It is about building agile frameworks that turn complexity into a competitive advantage.', 'Vision Â· Agility Â· Disciplined execution') },
        pricingSection('Pricing', 'Consultation packages', 'Transparent options for discovery, focused strategy work and deeper deal reviews.', ''),
        { __component: 'sections.approach', ...section('Approach', 'Strategy with disciplined execution.', 'I collaborate closely with executive leadership to move beyond backward-looking financial reporting and build agile, proactive frameworks for business planning, sustainable expansion, international exposure management and enduring enterprise value creation.', [['Understand the business', 'Align on strategic ambitions, operational context, capital requirements and financial constraints across executive stakeholders.'], ['Shape the financial framework', 'Translate corporate priorities into actionable capital plans, internal controls, governance structures and clear investment choices.'], ['Execute and adapt', 'Support implementation, monitor risk exposure, calibrate capital allocation and adjust as market conditions and opportunities evolve.']]) },
        { __component: 'sections.insights', ...section('Insights', 'Perspectives on financial strategy', 'Articles published on LinkedIn, alongside future writing on corporate finance, M&A, FP&A, capital governance and international leadership.', [['Add your LinkedIn article title here', 'Replace this card with a real LinkedIn post or article URL once published. No invented credentials or content.'], ['Second article placeholder', 'Link out to published perspectives on capital allocation, governance or cross-border leadership.'], ['Future writing slot', 'Reserved for upcoming pieces on M&A, FP&A and international financial leadership.']]) },
        { __component: 'sections.faq', ...section('FAQ', 'Common questions', 'Practical details regarding consultation scheduling, confidential discussions, and advisory arrangements.', [['How far in advance can I book?', 'Appointments can be booked from tomorrow up to 60 days ahead. Availability respects working hours in Asia/Dubai and existing calendar commitments.'], ['How do meetings take place?', 'Every confirmed booking includes a Google Meet link. You also receive a calendar invitation to the email address you provide.'], ['What are the consultation fees?', 'Fees are listed on this page and confirmed during booking. Current amounts are placeholders until the practice owner sets final pricing. Discovery calls may be complimentary.'], ['Can I reschedule or cancel?', 'Yes. Your confirmation email includes a secure link to reschedule or cancel. Please give as much notice as possible so the slot can be released.'], ['Is the conversation confidential?', 'Yes. Engagements are handled with independence and confidentiality appropriate to board-level and executive discussions.'], ['Do you offer ongoing advisory?', 'Monthly advisory retainers are available by enquiry. Use the contact form or select the retainer option when booking.']]) },
        { __component: 'sections.contact', ...section('Contact', 'Letâ€™s turn complexity into opportunity.', 'Interested in exploring strategic advisory, board representation, or corporate finance initiatives? I welcome a confidential conversation regarding your organisationâ€™s objectives.', [['Direct email', 'bbm@birendramishra.com'], ['Confidentiality', 'All discussions protected by board-level executive discretion.'], ['Response time', 'Direct, confidential communication. You will receive a response within 24â€“48 hours.'], ['Form', 'Send an enquiry'], ['Name placeholder', 'First and last name'], ['Email placeholder', 'name@company.com'], ['Company placeholder', 'Organisation name'], ['Phone placeholder', '+971 50 000 0000'], ['Topic placeholder', 'e.g. Capital allocation review, M&A advisory'], ['Message placeholder', 'Brief outline of strategic scope, timeline and objectives...']]) },
      ]),
      seo: { metaTitle: 'Birendra Mishra | Strategic Financial Leadership', metaDescription: 'Strategic financial leadership for complex decisions, international growth and enduring enterprise value. Book a confidential consultation with Birendra Mishra.', canonicalUrl: 'https://birendramishra.com/', ogTitle: 'Birendra Mishra | Strategic Financial Leadership', ogDescription: 'Clarity for your next chapter. Strategic financial leadership for complex decisions, international growth and enduring enterprise value.', ogImageUrl: 'https://birendramishra.com/assets/og-image.svg', twitterCard: 'summary_large_image', noIndex: false, jsonLd: { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'Birendra Mishra Strategic Financial Leadership', url: 'https://birendramishra.com/' } },
    },
  });
  await strapi.documents(uid).publish({ documentId: document.documentId });

  const pageUid = 'api::page.page';
  const pages = [
    { title: 'Privacy policy', slug: 'privacy', description: 'This policy explains how personal information is handled when you use this website, submit an enquiry, or book a consultation with Birendra Mishra.', meta: 'Privacy policy for Birendra Mishra Strategic Financial Leadership website and appointment booking.', items: [
      ['What we collect', 'When you book or enquire, we may collect your name, email address, phone number, company name, and the content of your message or booking notes. Technical logs from Google Calendar, Gmail and Google Sheets may store related metadata needed to run the booking service.'],
      ['How we use it', 'We use your information to schedule consultations, send confirmations and reminders, create Google Meet links, respond to enquiries, and keep a record of appointments. We do not sell personal data.'],
      ['Legal basis', 'Processing is based on your consent (forms and booking) and on legitimate interest in providing the requested advisory service and preventing double-booking.'],
      ['Retention', 'Booking records are retained for as long as needed for the engagement and ordinary business records, then deleted or anonymised where practicable.'],
      ['Sharing', 'Booking data is processed using Google services (Calendar, Gmail, Sheets, Meet) under the site ownerâ€™s Google account. Payment, if enabled, is handled by the payment provider you are redirected to (e.g. Stripe or PayPal).'],
      ['Your rights', 'You may request access, correction or deletion of your personal data by emailing bbm@birendramishra.com.'],
      ['Cookies & analytics', 'This site is designed to work without non-essential cookies. If a cookie-free analytics script is later enabled in configuration, it will be disclosed here.'],
      ['Contact', 'Questions about privacy: bbm@birendramishra.com.'],
    ] },
    { title: 'Terms of engagement', slug: 'terms', description: 'Terms governing consultations with Birendra Mishra Strategic Financial Leadership.', meta: 'Terms of engagement for consultations with Birendra Mishra Strategic Financial Leadership.', items: [
      ['Nature of services', 'Consultations provide strategic financial leadership advice for informational and professional discussion purposes. They do not constitute legal, tax, audit or regulated investment advice unless separately agreed in writing.'],
      ['Bookings & fees', 'Fees displayed on the website are set by the practice owner and may be marked as placeholders until confirmed. Paid sessions may require payment via a third-party link before confirmation. Discovery calls, where offered as complimentary, carry no fee.'],
      ['Cancellations & rescheduling', 'You may cancel or request a reschedule using the link in your confirmation email. Reasonable notice is appreciated so the slot can be released. Specific cancellation policies for paid sessions may be confirmed in your booking email.'],
      ['Confidentiality', 'Discussions are treated as confidential. You agree not to share meeting links with unauthorised parties.'],
      ['Technology', 'Meetings are typically held on Google Meet. You are responsible for a suitable device, connection and quiet environment.'],
      ['Limitation', 'To the fullest extent permitted by law, liability arising from a consultation is limited to the fee paid for that session.'],
      ['Contact', 'bbm@birendramishra.com'],
    ] },
    { title: 'Book a consultation', slug: 'book', description: 'Select a consultation type, choose a time within the next 60 days, and confirm your details. You will receive a calendar invitation with a Google Meet link.', meta: 'Book a confidential consultation with Birendra Mishra. Choose a package, pick a slot up to 60 days ahead, and receive a Google Meet link by email.', items: [['Step 1', 'Choose a consultation'], ['Step 2', 'Pick a date & time'], ['Step 3', 'Your details'], ['Step 4', 'Confirm booking'], ['Confirmation', 'A confirmation email with the Google Meet link and calendar details has been sent.']] },
    { title: 'Manage your booking', slug: 'manage', description: 'Use the secure token from your confirmation email to look up, cancel or request a reschedule.', meta: '', noIndex: true, items: [['Booking token', 'Paste the token from your confirmation email.'], ['Action', 'Look up booking, cancel booking, or request reschedule.'], ['Preferred new times', 'Suggest dates/times or leave blank and we will reply with options.']] },
    { title: 'Page not found', slug: '404', description: 'The page you requested is not available. Return home or book a consultation.', meta: '', noIndex: true, items: [['Home', 'Return to the home page.'], ['Book a consultation', 'Choose a consultation and a suitable time.']] },
  ];
  for (const page of pages) {
    if (await strapi.documents(pageUid).findFirst({ filters: { slug: page.slug }, status: 'published' })) continue;
    const sections: Array<Record<string, any>> = [{ __component: 'sections.about', eyebrow: page.slug === 'book' || page.slug === 'manage' ? 'Bookings' : 'Legal', heading: page.title, description: page.description, items: items(page.items) }];
    if (page.slug === 'book') sections.push(pricingSection('Consultations', 'Choose a consultation', 'Choose a consultation that fits your priorities and schedule.', ''));
    const entry = await strapi.documents(pageUid).create({ data: { title: page.title, slug: page.slug, ...namedSections(sections), seo: { metaTitle: page.meta ? `${page.title} | Birendra Mishra` : page.title, metaDescription: page.meta || page.description, noIndex: Boolean(page.noIndex) } } });
    await strapi.documents(pageUid).publish({ documentId: entry.documentId });
  }
}
