import { ConfigApi, IdentityApi } from '@backstage/core-plugin-api';
import { stringify } from 'query-string';

import {
  ApiClientError,
  ApiErrorResponse,
  InfraKitchenApi,
} from '@electrolux-oss/infrakitchen';
import { GetListParams } from '@electrolux-oss/infrakitchen';
import { fetchJson, Options } from '@electrolux-oss/infrakitchen';

const parseErrorBody = async (response: Response): Promise<void> => {
  let errorBody: ApiErrorResponse;
  try {
    errorBody = await response.json();
  } catch (_) {
    throw new Error(`${response.status} ${response.statusText}.`);
  }

  if (errorBody && errorBody.message && errorBody.error_code) {
    throw new ApiClientError(
      response.status,
      errorBody.message,
      errorBody.error_code,
      errorBody.metadata,
    );
  } else if (errorBody && errorBody.message) {
    throw new ApiClientError(
      response.status,
      errorBody.message,
      'unknown_error',
      errorBody.metadata || {},
    );
  } else {
    throw new Error(`${response.status} ${response.statusText}.`);
  }
};

/** @public */
export class InfraKitchenApiClient implements InfraKitchenApi {
  private readonly identityApi: IdentityApi;
  private readonly backendUrl: string;

  constructor(options: { identityApi: IdentityApi; configApi: ConfigApi }) {
    this.identityApi = options.identityApi;
    this.backendUrl = `${options.configApi.getString(
      'backend.baseUrl',
    )}/api/proxy/infrakitchen/api/`;
  }

  async httpClient(url: string, options: any = {}) {
    const { token: idToken } = await this.identityApi.getCredentials();
    if (!options.headers) {
      options.headers = new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      });
    }

    return fetch(url, options).then(async response => {
      if (!response.ok) {
        await parseErrorBody(response);
      }
      const text = await response.text();
      let json;
      try {
        json = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error(`Failed to parse JSON response: ${e}`);
      }
      return {
        status: response.status,
        headers: response.headers,
        body: text,
        json,
      };
    });
  }

  async setAuthToken(options: Options) {
    const { token: idToken } = await this.identityApi.getCredentials();
    options.user = options.user || {};
    if (idToken) {
      options.user.authenticated = true;
      options.user.token = `Bearer ${idToken}`;
    }
  }

  async getList(resource: string, params: GetListParams) {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: 'id', order: 'ASC' };

    const rangeStart = (page - 1) * perPage;
    const rangeEnd = page * perPage - 1;

    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([rangeStart, rangeEnd]),
      filter: JSON.stringify(params.filter),
    };

    const url = `${this.backendUrl}${resource}?${stringify(query)}`;
    const options: Options = {
      headers: new Headers({
        Range: `${resource}=${rangeStart}-${rangeEnd}`,
      }),
    };
    await this.setAuthToken(options);

    return fetchJson(url, options).then(({ headers, json }) => {
      if (!headers.has('Content-Range')) {
        throw new Error(
          `The Content-Range header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare Content-Range in the Access-Control-Expose-Headers header?`,
        );
      }
      return {
        data: json,
        total: parseInt(
          headers.get('content-range')!.split('/').pop() || '',
          10,
        ),
      };
    });
  }

  async getToken() {
    const { token: idToken } = await this.identityApi.getCredentials();
    return idToken as string | null;
  }

  async getTree(
    component: string,
    id: number | string,
    direction: 'parents' | 'children' | 'both' = 'children',
  ) {
    return this.httpClient(
      `${this.backendUrl}/${component}/${id}/tree/${direction}`,
    ).then(({ json }) => json);
  }

  async downloadFile(id: string) {
    // only work for resources for now
    const { token: idToken } = await this.identityApi.getCredentials();
    const url = `${this.backendUrl}/resources/${id}/debug`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (!response.ok) {
      const error = await response.text();
      const message = `Request failed with ${response.status} ${response.statusText}, ${error}`;
      throw new Error(message);
    }
    return await response.arrayBuffer();
  }

  async getVariableSchema(id: string, parent_resources?: string[]) {
    const parentResourcesQuery = parent_resources
      ? parent_resources.join(',')
      : '';
    const url = `${this.backendUrl}source_code_versions/${id}/variables?parent_resources=${parentResourcesQuery}`;
    return this.httpClient(url).then(({ json }) => json);
  }

  async get(path: string, params: { [key: string]: any } = {}) {
    const queryString = stringify(params);
    const url = `${this.backendUrl}${path}${
      queryString ? `?${queryString}` : ''
    }`;
    return this.httpClient(url).then(({ json }) => json);
  }

  async postRaw(path: string, params: { [key: string]: any }) {
    return this.httpClient(`${this.backendUrl}${path}`, {
      method: 'POST',
      body: JSON.stringify(params),
    }).then(({ json }) => json);
  }

  async updateRaw(path: string, params: { [key: string]: any }) {
    return this.httpClient(`${this.backendUrl}${path}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    }).then(({ json }) => json);
  }

  async patchRaw(path: string, params: { [key: string]: any }) {
    return this.httpClient(`${this.backendUrl}${path}`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    }).then(({ json }) => json);
  }

  async deleteRaw(path: string, params: { [key: string]: any }) {
    return this.httpClient(`${this.backendUrl}${path}`, {
      method: 'DELETE',
      body: JSON.stringify(params),
    }).then(({ json }) => json);
  }
}
