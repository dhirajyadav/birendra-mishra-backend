import { seedFallbackContent } from './seed/fallback';

export default {
  async register() {},
  async bootstrap({ strapi }) {
    await seedFallbackContent(strapi);
    const key = 'configuration_content_types::api::homepage.homepage';
    const store = strapi.store({ type: 'plugin', name: 'content_manager' });
    const configuration = await store.get({ key });
    const editLayout = configuration?.layouts?.edit;
    if (Array.isArray(editLayout)) {
      configuration.layouts.edit = editLayout.filter((row) => !row.some((field) => field.name === 'siteChrome' || field.name === 'seo'));
      configuration.layouts.edit.push([{ name: 'seo', size: 12 }]);
      if (configuration.metadatas?.siteChrome?.edit) {
        configuration.metadatas.siteChrome.edit.visible = false;
      }
      await store.set({ key, value: configuration });
    }

    const itemKey = 'configuration_components::shared.item';
    const itemConfiguration = await store.get({ key: itemKey });
    const itemLayout = itemConfiguration?.layouts?.edit;
    if (Array.isArray(itemLayout)) {
      const rows = itemLayout.map((row) => row.filter((field) => !['number', 'buttonText', 'buttonUrl'].includes(field.name))).filter((row) => row.length);
      const titleRow = rows.find((row) => row.some((field) => field.name === 'title'));
      if (titleRow) {
        const titleIndex = titleRow.findIndex((field) => field.name === 'title');
        const description = titleRow.find((field) => field.name === 'description');
        titleRow[titleIndex].size = 4;
        if (description) description.size = 6;
        titleRow.splice(titleIndex + 1, 0, { name: 'number', size: 2 });
      }
      itemConfiguration.layouts.edit = rows;
      itemConfiguration.metadatas.number.edit = {
        ...itemConfiguration.metadatas.number.edit,
        label: 'Pillar number',
        description: 'Custom badge shown on each Pillars card. Leave blank in other sections.',
        placeholder: '01',
        visible: true,
      };
      itemConfiguration.layouts.edit.push([{ name: 'buttonText', size: 6 }, { name: 'buttonUrl', size: 6 }]);
      itemConfiguration.metadatas.buttonText.edit = {
        ...itemConfiguration.metadatas.buttonText.edit,
        label: 'Pricing button text', placeholder: 'Book', visible: true,
      };
      itemConfiguration.metadatas.buttonUrl.edit = {
        ...itemConfiguration.metadatas.buttonUrl.edit,
        label: 'Pricing button link', placeholder: 'book.html', visible: true,
      };
      await store.set({ key: itemKey, value: itemConfiguration });
    }

    const buttonLayouts = [
      { uid: 'sections.hero', buttons: [['primaryButtonText', 'Primary button text', 'Book a consultation'], ['primaryButtonUrl', 'Primary button link', 'book.html'], ['secondaryButtonText', 'Secondary button text', 'Explore services'], ['secondaryButtonUrl', 'Secondary button link', '#services']] },
      { uid: 'sections.about', buttons: [['primaryButtonText', 'Primary button text', 'Book a consultation'], ['primaryButtonUrl', 'Primary button link', 'book.html'], ['secondaryButtonText', 'Secondary button text', 'Email BMM'], ['secondaryButtonUrl', 'Secondary button link', 'mailto:bbm@birendramishra.com']] },
      { uid: 'sections.services', buttons: [['primaryButtonText', 'Primary button text', 'Book a consultation'], ['primaryButtonUrl', 'Primary button link', 'book.html'], ['secondaryButtonText', 'Secondary button text', 'View availability'], ['secondaryButtonUrl', 'Secondary button link', 'book.html']] },
      { uid: 'sections.insights', buttons: [['primaryButtonText', 'Button text', 'LinkedIn profile'], ['primaryButtonUrl', 'Button link', 'https://www.linkedin.com/']] },
      { uid: 'sections.contact', buttons: [['primaryButtonText', 'Submit button text', 'Send enquiry']] },
    ];
    for (const component of buttonLayouts) {
      const componentKey = `configuration_components::${component.uid}`;
      const componentConfig = await store.get({ key: componentKey });
      if (!Array.isArray(componentConfig?.layouts?.edit)) continue;
      const names = component.buttons.map(([name]) => name);
      componentConfig.layouts.edit = componentConfig.layouts.edit.filter((row) => !row.some((field) => names.includes(field.name)));
      for (const [name, label, placeholder] of component.buttons) {
        componentConfig.layouts.edit.push([{ name, size: 12 }]);
        componentConfig.metadatas[name].edit = {
          ...componentConfig.metadatas[name].edit,
          label, placeholder, description: 'Updates the existing button text or destination on the frontend.', visible: true,
        };
      }
      await store.set({ key: componentKey, value: componentConfig });
    }
  },
};
