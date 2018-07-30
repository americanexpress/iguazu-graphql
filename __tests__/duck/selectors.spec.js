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
import 'fetch-everywhere';

import config from '../../src/config';

import { getStateBranch, getStateOfQuery } from '../../src/duck/selectors';

describe('duck', () => {
  describe('selectors', () => {
    describe('getStateBranch', () => {
      const stateBranch = new ImmutableMap();
      const state = new ImmutableMap({
        a: new ImmutableMap({
          b: stateBranch,
        }),
      });

      it('is a function', () => expect(getStateBranch).toBeInstanceOf(Function));
      it('selects the state branch from a state value', () => {
        config.getToState = jest.fn(rootState => rootState.getIn(['a', 'b']));
        expect(getStateBranch(state)).toBe(stateBranch);
      });

      it('selects the state branch from a getState function', () => {
        config.getToState = jest.fn(rootState => rootState.getIn(['a', 'b']));
        const getState = jest.fn(() => state);
        expect(getStateBranch(getState)).toBe(stateBranch);
      });
    });

    describe('getStateOfQuery', () => {
      it('is a function', () => expect(getStateOfQuery).toBeInstanceOf(Function));

      it('gets the stored state of the query request', () => {
        const endpointName = 'sample-endpoint';
        const query = '{a{b}}';
        const storedStateOfQuery = new ImmutableMap({
          status: 'complete',
          data: { a: { b: 'hello' } },
        });
        const originalState = new ImmutableMap({
          endpoints: new ImmutableMap({
            [endpointName]: new ImmutableMap({
              queries: new ImmutableMap({
                [hash(query)]: new ImmutableMap({
                  typenames: new ImmutableSet(['A']),
                  variables: new ImmutableMap({
                    [hash(null)]: storedStateOfQuery,
                  }),
                }),
              }),
            }),
          }),
        });
        config.getToState = s => s;

        const fetchedStateOfQuery = getStateOfQuery({
          endpointName,
          query,
          variables: null,
        })(originalState);
        expect(fetchedStateOfQuery).toBe(storedStateOfQuery);
      });

      it('separates queries by endpoint', () => {
        const endpointNameA = 'endpoint-a';
        const endpointNameB = 'endpoint-b';
        const query = '{a{b}}';
        const storedStateOfQueryToA = new ImmutableMap({
          status: 'complete',
          data: { a: { b: 'hello' } },
        });
        const storedStateOfQueryToB = new ImmutableMap({
          status: 'complete',
          data: { a: { b: 'hello' } },
        });
        const originalState = new ImmutableMap({
          endpoints: new ImmutableMap({
            [endpointNameA]: new ImmutableMap({
              queries: new ImmutableMap({
                [hash(query)]: new ImmutableMap({
                  typenames: new ImmutableSet(['A']),
                  variables: new ImmutableMap({
                    [hash(null)]: storedStateOfQueryToA,
                  }),
                }),
              }),
            }),
            [endpointNameB]: new ImmutableMap({
              queries: new ImmutableMap({
                [hash(query)]: new ImmutableMap({
                  typenames: new ImmutableSet(['A']),
                  variables: new ImmutableMap({
                    [hash(null)]: storedStateOfQueryToB,
                  }),
                }),
              }),
            }),
          }),
        });
        config.getToState = s => s;

        const fetchedStateOfQueryForA = getStateOfQuery({
          endpointName: endpointNameA,
          query,
          variables: null,
        })(originalState);
        expect(fetchedStateOfQueryForA).toBe(storedStateOfQueryToA);

        const fetchedStateOfQueryForB = getStateOfQuery({
          endpointName: endpointNameB,
          query,
          variables: null,
        })(originalState);
        expect(fetchedStateOfQueryForB).toBe(storedStateOfQueryToB);
      });
    });
  });
});
