import { FC, useCallback, useMemo } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Page, Header, Content, HeaderTabs } from '@backstage/core-components';
import {
  ConfigProvider,
  EventProvider,
  NotificationProvider,
  GlobalNotificationPopup,
  LocalStorageProvider,
  RouterSnackbarWrapper,
  PermissionProvider,
  useFilteredProtectedRoutes,
  usePermissionProvider,
  GradientCircularProgress,
} from '@electrolux-oss/infrakitchen';

import { useApi } from '@backstage/core-plugin-api';
import { infraKitchenApiRef } from './api/InfraKitchenApi';
import { InfraKitchenColorOverrideProvider } from './InfraKitchenColorOverrideProvider';
import { Box } from '@material-ui/core';

const PermissionFilteredRouter = () => {
  const accessibleRoutes = useFilteredProtectedRoutes();
  const { permissions } = usePermissionProvider();

  // If no permissions are defined yet, don't render any routes
  if (Object.keys(permissions).length === 0) {
    return null;
  }

  return (
    <>
      <RouterSnackbarWrapper />
      <Routes>
        {accessibleRoutes.map((route, index) => (
          <Route
            key={route.path || index}
            path={route.path}
            element={route.Component ? <route.Component /> : route.element}
          />
        ))}
      </Routes>
    </>
  );
};

const allTabs = [
  {
    id: 'resources',
    label: 'Resources',
    path: '/resources',
    permissionKey: 'resource',
  },
  {
    id: 'templates',
    label: 'Templates',
    path: '/templates',
    permissionKey: 'template',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    path: '/integrations',
    permissionKey: 'integration',
  },
  {
    id: 'storage',
    label: 'Storage',
    path: '/storages',
    permissionKey: 'storage',
  },
  {
    id: 'source-codes',
    label: 'Source Codes',
    path: '/source_codes',
    permissionKey: 'source_code',
  },
  {
    id: 'source-code-versions',
    label: 'Source Code Versions',
    path: '/source_code_versions',
    permissionKey: 'source_code_version',
  },
  {
    id: 'workspaces',
    label: 'Workspaces',
    path: '/workspaces',
    permissionKey: 'workspace',
  },
  { id: 'tasks', label: 'Tasks', path: '/tasks', permissionKey: 'task' },
  {
    id: 'executors',
    label: 'Executors',
    path: '/executors',
    permissionKey: 'executor',
  },
  {
    id: 'secrets',
    label: 'Secrets',
    path: '/secrets',
    permissionKey: 'secret',
  },
  {
    id: 'batch-operations',
    label: 'Batch Operations',
    path: '/batch_operations',
    permissionKey: 'batch_operation',
  },
  {
    id: 'auth-providers',
    label: 'Auth Providers',
    path: '/auth_providers',
    permissionKey: 'auth_provider',
  },
  { id: 'settings', label: 'Settings', path: '/admin', permissionKey: '*' },
];

const InfrakitchenApp: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, loading } = usePermissionProvider();

  // Filter tabs based on user permissions
  const tabs = useMemo(() => {
    return allTabs.filter(tab => {
      // Admin permission grants access to all
      if (permissions['*'] === 'admin') {
        return true;
      }
      // Check if user has any permission level for this resource
      return !!permissions[`api:${tab.permissionKey}`];
    });
  }, [permissions]);

  const basePath = useMemo(() => {
    const path = location.pathname;
    const knownRoutes = tabs.map(t => t.path);

    // Try to find the base path by checking if path starts with a potential base + known route
    for (const route of knownRoutes) {
      // Find where the route appears in the path
      const routeIndex = path.indexOf(route);
      if (routeIndex > 0) {
        // Check if this is actually the start of a route segment (not part of another segment)
        const potentialBase = path.substring(0, routeIndex);
        const afterRoute = path.substring(routeIndex + route.length);

        // Verify: the route should be at the start of what's after the base
        // and either be at the end or followed by a slash
        if (afterRoute === '' || afterRoute.startsWith('/')) {
          return potentialBase.replace(/\/$/, '');
        }
      }
    }

    return path.replace(/\/$/, '') || '/';
  }, [location.pathname, tabs]);

  // Determine which tab is active based on current path
  const selectedTabIndex = useMemo(() => {
    const relativePath =
      location.pathname.replace(basePath, '').replace(/\/$/, '') || '/';
    const index = tabs.findIndex(tab => {
      if (tab.path === '/') {
        return relativePath === '/';
      }
      return relativePath.startsWith(tab.path);
    });
    return index >= 0 ? index : 0;
  }, [location.pathname, basePath, tabs]);

  const handleTabChange = useCallback(
    (index: number) => {
      const tab = tabs[index];
      if (!tab) return;
      const targetPath = tab.path === '/' ? basePath : `${basePath}${tab.path}`;
      navigate(targetPath);
    },
    [tabs, navigate, basePath],
  );
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <GradientCircularProgress />
      </Box>
    );
  }

  return (
    <Page themeId="home">
      <Header
        title="InfraKitchen"
        subtitle="Run your infrastructure like a Michelin-starred kitchen."
      />
      <Content>
        {tabs.length > 0 && (
          <HeaderTabs
            selectedIndex={selectedTabIndex}
            tabs={tabs}
            onChange={handleTabChange}
          />
        )}
        <PermissionFilteredRouter />
        <GlobalNotificationPopup />
      </Content>
    </Page>
  );
};

export const AppWrapper = () => {
  const ikApi = useApi(infraKitchenApiRef);

  return (
    <InfraKitchenColorOverrideProvider>
      <LocalStorageProvider>
        <ConfigProvider
          initialIkApi={ikApi}
          initialLinkPrefix="/infrakitchen/"
          webSocketEnabled={false}
        >
          <PermissionProvider>
            <EventProvider>
              <NotificationProvider>
                <InfrakitchenApp />
              </NotificationProvider>
            </EventProvider>
          </PermissionProvider>
        </ConfigProvider>
      </LocalStorageProvider>
    </InfraKitchenColorOverrideProvider>
  );
};

export default AppWrapper;
