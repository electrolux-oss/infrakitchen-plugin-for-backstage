import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { InfraKitchenApiClient } from './api/InfraKitchenApiClient';
import { infraKitchenApiRef } from './api/InfraKitchenApi';

export const infrakitchenPlugin = createPlugin({
  id: 'infrakitchen',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: infraKitchenApiRef,
      deps: { identityApi: identityApiRef, configApi: configApiRef },
      factory: ({ identityApi, configApi }) =>
        new InfraKitchenApiClient({ identityApi, configApi }),
    }),
  ],
});

export const InfraKitchenApp = infrakitchenPlugin.provide(
  createRoutableExtension({
    name: 'InfrakitchenPage',
    component: () => import('./App').then(m => m.AppWrapper),
    mountPoint: rootRouteRef,
  }),
);
