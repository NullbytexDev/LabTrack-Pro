import { api } from '@/api/apiClient';

/**
 * Read-only entity access for the pages.
 *
 * Same call shapes the pages used before (filter / list / get / count / aggregate),
 * served by the app's own data service through the dataRead function, so no page
 * talks to storage directly.
 */

async function read(entity, op, payload = {}) {
  const response = await api.functions.invoke('dataRead', { entity, op, ...payload });
  return response.data;
}

function entityApi(entity) {
  return {
    filter: (query = {}, options = {}) => read(entity, 'filter', { query, options }),
    list: (options = {}) => read(entity, 'list', { options }),
    get: async (id) => {
      try {
        return await read(entity, 'get', { id });
      } catch (error) {
        if (String(error?.message || '').includes('Not found')) {
          throw Object.assign(new Error('Not found'), { status: 404 });
        }
        throw error;
      }
    },
    count: async (query = {}) => {
      const result = await read(entity, 'count', { query });
      return Number(result?.value) || 0;
    },
    aggregate: (payload = {}) => read(entity, 'aggregate', payload),
  };
}

export const entities = {
  Lab: entityApi('Lab'),
  PC: entityApi('PC'),
  IssueReport: entityApi('IssueReport'),
  Profile: entityApi('Profile'),
  Message: entityApi('Message'),
};