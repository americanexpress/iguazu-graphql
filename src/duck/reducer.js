/*
 * Copyright 2018 American Express
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { Map as ImmutableMap, Set as ImmutableSet } from 'immutable';
import hash from 'object-hash';

import {
  QUERY_STARTED, QUERY_FINISHED, QUERY_ERROR, INVALIDATE_QUERY,
  MUTATION_STARTED, MUTATION_FINISHED, MUTATION_ERROR,
} from './types';

function buildInitialState() {
  return new ImmutableMap({
    /*
    endpoints: {
      [endpointName]: {
        queries: {
          [queryId]: {
            typenames: [ "typename", "typename" ],
            variables: {
              [variablesId]: { promise, status, data, error }
            }
          }
        }
      }
    }
    */
    endpoints: new ImmutableMap(),
  });
}

function getEndpointIdFromAction(action, actionType) {
  const { endpointName } = action;
  if (typeof endpointName !== 'string' || !endpointName) {
    throw new Error(`${actionType} action must supply the endpoint name`);
  }
  return endpointName;
}

function getIdsFromAction(action, actionType) {
  const { query, variables = null } = action;
  const endpointId = getEndpointIdFromAction(action, actionType);

  if (typeof query !== 'string' || !query) {
    throw new Error(`${actionType} action must supply the query`);
  }

  if (typeof variables !== 'object') {
    throw new Error(`${actionType} action must supply variables as an object`);
  }
  const queryId = hash(query);
  const variablesId = hash(variables);
  return { endpointId, queryId, variablesId };
}

function graphqlReducer(state = buildInitialState(), action) {
  switch (action.type) {
    case QUERY_STARTED: {
      const { endpointId, queryId, variablesId } = getIdsFromAction(action, QUERY_STARTED);
      const { promise } = action;
      // If any keys in keyPath do not exist, a new immutable Map will be created at that key.
      // https://facebook.github.io/immutable-js/docs/#/Map/setIn
      return state.setIn(['endpoints', endpointId, 'queries', queryId, 'variables', variablesId], new ImmutableMap({ promise, status: 'loading' }));
    }
    case QUERY_FINISHED: {
      const { endpointId, queryId, variablesId } = getIdsFromAction(action, QUERY_FINISHED);
      const { data, error, typenames } = action;
      return state
        .setIn(['endpoints', endpointId, 'queries', queryId, 'variables', variablesId], new ImmutableMap({ status: 'complete', data, error }))
        .updateIn(['endpoints', endpointId, 'queries', queryId, 'typenames'], (storedTypenames = new ImmutableSet()) => storedTypenames.union(new ImmutableSet(typenames)));
    }
    case QUERY_ERROR: {
      const { endpointId, queryId, variablesId } = getIdsFromAction(action, QUERY_ERROR);
      const { error } = action;
      return state.setIn(['endpoints', endpointId, 'queries', queryId, 'variables', variablesId], new ImmutableMap({ status: 'complete', error }));
    }
    case INVALIDATE_QUERY: {
      const { query } = action;
      const endpointId = getEndpointIdFromAction(action, INVALIDATE_QUERY);
      const queryId = hash(query);
      return state.deleteIn(['endpoints', endpointId, 'queries', queryId]);
    }
    case MUTATION_STARTED:
      // noop, don't need to store/cache mutations
      return state;
    case MUTATION_FINISHED: {
      const { typenames } = action;
      const endpointId = getEndpointIdFromAction(action, MUTATION_FINISHED);
      return state
        .setIn(['endpoints', endpointId, 'queries'], state.getIn(['endpoints', endpointId, 'queries'], new ImmutableMap()).withMutations((queries) => {
          if (!typenames) { return; }
          typenames.forEach(typename => queries.entrySeq().forEach(([queryId, queryEntry]) => {
            if (queryEntry.get('typenames').includes(typename)) {
              queries.delete(queryId);
            }
          }));
        }));
    }
    case MUTATION_ERROR:
      // noop
      return state;
    default:
      return state;
  }
}

export default graphqlReducer;
