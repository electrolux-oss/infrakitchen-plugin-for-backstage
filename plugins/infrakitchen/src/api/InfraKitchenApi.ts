import { createApiRef } from '@backstage/core-plugin-api';
import { InfraKitchenApi } from '@electrolux-oss/infrakitchen';

/** @public */
export const infraKitchenApiRef = createApiRef<InfraKitchenApi>({
  id: 'plugin.infrakitchen',
});
