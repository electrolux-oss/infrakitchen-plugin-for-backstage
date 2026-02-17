import { createDevApp } from '@backstage/dev-utils';
import { infrakitchenPlugin, InfraKitchenApp } from '../src/plugin';

createDevApp()
  .registerPlugin(infrakitchenPlugin)
  .addPage({
    element: <InfraKitchenApp />,
    title: 'Root Page',
    path: '/infrakitchen',
  })
  .render();
