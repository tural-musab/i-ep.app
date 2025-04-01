/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Giriş',
    },
    {
      type: 'category',
      label: 'Onboarding',
      items: [
        'onboarding/README',
        'onboarding/setup-guide',
        'onboarding/architecture-overview',
        'onboarding/code-standards',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/endpoints',
      ],
    },
    {
      type: 'category',
      label: 'Test',
      items: [
        'testing/multi-tenant-testing',
      ],
    },
    {
      type: 'category',
      label: 'Komponentler',
      items: [
        'components/super-admin-panel',
      ],
    },
  ],
};

module.exports = sidebars; 