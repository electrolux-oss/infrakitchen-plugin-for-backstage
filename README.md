# InfraKitchen Plugin for Backstage

The InfraKitchen plugin integrates [InfraKitchen](https://github.com/electrolux-oss/infrakitchen) infrastructure management capabilities directly into your Backstage instance. This plugin provides a seamless interface to interact with InfraKitchen APIs, enabling developers and platform engineers to manage infrastructure resources from within the Backstage developer portal.

## Features

- 🚀 Full integration with InfraKitchen API
- 🔐 Built-in authentication using Backstage identity
- 🎨 Consistent UI/UX with Backstage design system
- 📊 Infrastructure resource visualization
- 🔄 Automatic configuration from Backstage backend

## Installation

### 1. Install the plugin package

```bash
# From your Backstage root directory
yarn --cwd packages/app add @electrolux-oss/infrakitchen-plugin-for-backstage
```

### 2. Configure the proxy

Add the InfraKitchen proxy configuration to your `app-config.yaml`:

```yaml
proxy:
  endpoints:
    '/infrakitchen':
      target: 'http://your-infrakitchen-instance:7777'
      allowedHeaders:
        - 'Authorization'
        - 'Range'
        - 'Content-Range'
        - 'Access-Control-Expose-Headers'
      changeOrigin: true
```

Replace `http://your-infrakitchen-instance:7777` with your actual InfraKitchen instance URL.

### 3. Add the plugin to your app

Edit `packages/app/src/App.tsx` to import and use the plugin:

```tsx
// Add the import at the top
import { InfraKitchenApp } from '@electrolux-oss/infrakitchen-plugin-for-backstage';

// Add the route inside your FlatRoutes component
const routes = (
  <FlatRoutes>
    {/* ...other routes */}
    <Route path="/infrakitchen" element={<InfraKitchenApp />} />
  </FlatRoutes>
);
```

### 4. Add navigation item (Optional)

To add InfraKitchen to your sidebar navigation, edit `packages/app/src/components/Root/Root.tsx`:

```tsx
import CloudIcon from '@material-ui/icons/Cloud';

// Inside your SidebarPage component
<SidebarItem icon={CloudIcon} to="infrakitchen" text="InfraKitchen" />;
```

### 5. Start your Backstage app

```bash
yarn dev
```

Navigate to [http://localhost:3000/infrakitchen](http://localhost:3000/infrakitchen) to access the plugin.

## Configuration

### Backend Configuration

The plugin uses Backstage's proxy configuration to communicate with your InfraKitchen instance. Ensure the following is configured in your `app-config.yaml`:

```yaml
backend:
  baseUrl: http://localhost:7007

proxy:
  endpoints:
    '/infrakitchen':
      target: 'http://your-infrakitchen-instance:7777'
      changeOrigin: true
      allowedHeaders:
        - 'Authorization'
        - 'Range'
        - 'Content-Range'
        - 'Access-Control-Expose-Headers'
```

Ensure the CORS configuration in your `app-config.yaml` allows passing required headers:

```yaml
backend:
  # ...
  cors:
    origin:
      - http://${HOSTNAME}:3000
      - http://127.0.0.1:3000
    methods: [GET, HEAD, PATCH, POST, PUT, DELETE]
    credentials: true
    allowedHeaders:
      - Authorization
      - Content-Range  # <- This can be overlooked
      - Content-Type
      - Range          # <- This can be overlooked
      - X-User-Id
      - x-requested-with
  reading:
    allow:
      - host: ${HOSTNAME}:3000
      - host: 127.0.0.1:3000
```

### Authentication

The plugin automatically uses Backstage's identity API to authenticate requests to InfraKitchen.
Please follow the [Infrakitchen integration documentation](https://opensource.electrolux.one/infrakitchen/integrations/auth/backstage/) to set up authentication for your Backstage instance, and ensure that your InfraKitchen instance is configured to accept the appropriate authentication tokens.

## Development

### Local Development

To develop the plugin in isolation:

```bash
yarn start
```

## API

The plugin exports the following:

- **`InfraKitchenApp`**: The main component that renders the InfraKitchen interface
- **`infrakitchenPlugin`**: The plugin instance
- **`infraKitchenApiRef`**: API reference for the InfraKitchen API client

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](./LICENSE) file for details.

## Support

For issues and questions:

- GitHub Issues: [Report an issue](https://github.com/electrolux-oss/infrakitchen-plugin-for-backstage/issues)
- InfraKitchen Documentation: [https://opensource.electrolux.one/infrakitchen](https://opensource.electrolux.one/infrakitchen)

## Links

- [InfraKitchen](https://github.com/electrolux-oss/infrakitchen)
- [Backstage](https://backstage.io)
- [Plugin Development Guide](https://backstage.io/docs/plugins/)
