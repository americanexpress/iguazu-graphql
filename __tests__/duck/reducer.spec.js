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
import reducer from '../../src/duck/reducer';

import {
  QUERY_STARTED, QUERY_FINISHED, QUERY_ERROR, INVALIDATE_QUERY,
  MUTATION_STARTED, MUTATION_FINISHED, MUTATION_ERROR,
} from '../../src/duck/types';

// TODO: how to test the state to be deeply immutable?
describe('duck', () => {
  describe('reducer', () => {
    it('is a function', () => expect(reducer).toBeInstanceOf(Function));
    it('builds and returns an inital state', () => {
      const action = { type: '@@irrelevant' };
      const newState = reducer(undefined, action);
      expect(newState).toBeDefined();
      expect(newState).toMatchSnapshot();
    });

    describe('QUERY_STARTED', () => {
      const type = QUERY_STARTED;
      const endpointName = 'sample-endpoint';
      const query = '{a{b}}';
      const queryHash = hash(query);

      it('adds the query to the query map', () => {
        const action = { type, endpointName, query };
        const newState = reducer(undefined, action);
        expect(newState.hasIn(['endpoints', endpointName, 'queries'])).toBe(true);
        expect(ImmutableMap.isMap(newState.getIn(['endpoints', endpointName, 'queries']))).toBe(true);
        expect(newState.hasIn(['endpoints', endpointName, 'queries', queryHash])).toBe(true);
        expect(ImmutableMap.isMap(newState.getIn(['endpoints', endpointName, 'queries', queryHash]))).toBe(true);
      });

      it('adds the variables map', () => {
        const action = { type, endpointName, query };
        const newState = reducer(undefined, action);
        expect(newState.hasIn(['endpoints', endpointName, 'queries', queryHash, 'variables'])).toBe(true);
        expect(ImmutableMap.isMap(newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'variables']))).toBe(true);
      });

      it('adds the variables entry to the variables map', () => {
        const variablesHash = hash(null);
        const action = { type, endpointName, query };
        const newState = reducer(undefined, action);
        expect(newState.hasIn(['endpoints', endpointName, 'queries', queryHash, 'variables', variablesHash])).toBe(true);
        expect(ImmutableMap.isMap(newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'variables', variablesHash]))).toBe(true);
      });

      it('stores the request loading status to the variables entry', () => {
        const variablesHash = hash(null);
        const action = { type, endpointName, query };
        const newState = reducer(undefined, action);
        const variablesJSEntry = newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'variables', variablesHash]).toJS();
        expect(variablesJSEntry).toHaveProperty('status', 'loading');
      });

      it('stores the request promise to the variables entry', () => {
        const variablesHash = hash(null);
        const promise = Promise.resolve('data!');
        const action = {
          type, endpointName, query, promise,
        };
        const newState = reducer(undefined, action);
        const variablesJSEntry = newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'variables', variablesHash]).toJS();
        expect(variablesJSEntry).toHaveProperty('promise', promise);
      });

      it('requires the endpointName to be specified', () => {
        const action = { type, query };
        expect(() => reducer(undefined, action)).toThrowErrorMatchingSnapshot();
      });

      it('requires the query to be specified', () => {
        const action = { type, endpointName };
        expect(() => reducer(undefined, action)).toThrowErrorMatchingSnapshot();
      });

      it('requires the variables to be the right type', () => {
        const action = {
          type, endpointName, query, variables: false,
        };
        expect(() => reducer(undefined, action)).toThrowErrorMatchingSnapshot();
      });
    });

    describe('QUERY_FINISHED', () => {
      const type = QUERY_FINISHED;
      const endpointName = 'sample-endpoint';
      const query = '{a{b{c}}}';
      const queryHash = hash(query);

      it('adds the query to the query map if not already present', () => {
        const action = { type, endpointName, query };
        const newState = reducer(undefined, action);
        expect(newState.has('endpoints', endpointName, 'queries')).toBe(true);
        expect(ImmutableMap.isMap(newState.getIn(['endpoints', endpointName, 'queries']))).toBe(true);
        expect(newState.hasIn(['endpoints', endpointName, 'queries', queryHash])).toBe(true);
        expect(ImmutableMap.isMap(newState.getIn(['endpoints', endpointName, 'queries', queryHash]))).toBe(true);
      });

      it('adds the typenames to the query entry', () => {
        const action = {
          type, endpointName, query, typenames: ['A', 'B'],
        };
        const newState = reducer(undefined, action);
        expect(newState.hasIn(['endpoints', endpointName, 'queries', queryHash, 'typenames'])).toBe(true);
        expect(ImmutableSet.isSet(newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'typenames']))).toBe(true);
        expect(newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'typenames'])).toEqual(new ImmutableSet(['A', 'B']));
      });

      it('adds the new typenames to the query entry', () => {
        const firstState = reducer(undefined, {
          type, endpointName, query, typenames: ['A', 'B'],
        });
        expect(firstState.getIn(['endpoints', endpointName, 'queries', queryHash, 'typenames'])).toEqual(new ImmutableSet(['A', 'B']));
        const secondState = reducer(firstState, {
          type, endpointName, query, typenames: ['C', 'B'],
        });
        expect(secondState.getIn(['endpoints', endpointName, 'queries', queryHash, 'typenames'])).toEqual(new ImmutableSet(['A', 'B', 'C']));
      });

      it('stores the request complete status to the variables entry', () => {
        const variablesHash = hash(null);
        const action = { type, endpointName, query };
        const newState = reducer(undefined, action);
        const variablesJSEntry = newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'variables', variablesHash]).toJS();
        expect(variablesJSEntry).toHaveProperty('status', 'complete');
      });

      it('stores the request data to the variables entry', () => {
        const variablesHash = hash(null);
        const data = { a: { b: { c: 'hello' } } };
        const action = {
          type, endpointName, query, data,
        };
        const newState = reducer(undefined, action);
        const variablesJSEntry = newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'variables', variablesHash]).toJS();
        expect(variablesJSEntry).toHaveProperty('data', data);
      });

      it('stores the request errors as error to the variables entry', () => {
        const variablesHash = hash(null);
        const errors = [
          {
            message: 'Syntax Error GraphQL request (1:2) Expected Name, found <EOF>\n\n1: {\n    ^\n',
            locations: [
              {
                line: 1,
                column: 2,
              },
            ],
          },
        ];
        const action = {
          type, endpointName, query, error: errors,
        };
        const newState = reducer(undefined, action);
        const variablesJSEntry = newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'variables', variablesHash]).toJS();
        expect(variablesJSEntry).toHaveProperty('error', errors);
      });
    });

    describe('QUERY_ERROR', () => {
      const type = QUERY_ERROR;
      const endpointName = 'sample-endpoint';
      const query = '{a{b}}';
      const queryHash = hash(query);

      it('adds the query to the query map if not already present', () => {
        const action = { type, endpointName, query };
        const newState = reducer(undefined, action);
        expect(newState.has('endpoints', endpointName, 'queries')).toBe(true);
        expect(ImmutableMap.isMap(newState.getIn(['endpoints', endpointName, 'queries']))).toBe(true);
        expect(newState.hasIn(['endpoints', endpointName, 'queries', queryHash])).toBe(true);
        expect(ImmutableMap.isMap(newState.getIn(['endpoints', endpointName, 'queries', queryHash]))).toBe(true);
      });

      it('stores the request complete status to the variables entry', () => {
        const variablesHash = hash(null);
        const action = { type, endpointName, query };
        const newState = reducer(undefined, action);
        const variablesJSEntry = newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'variables', variablesHash]).toJS();
        expect(variablesJSEntry).toHaveProperty('status', 'complete');
      });

      it('stores the request error to the variables entry', () => {
        const variablesHash = hash(null);
        const error = new Error('test error like network issue');
        const action = {
          type, endpointName, query, error,
        };
        const newState = reducer(undefined, action);
        const variablesJSEntry = newState.getIn(['endpoints', endpointName, 'queries', queryHash, 'variables', variablesHash]).toJS();
        expect(variablesJSEntry).toHaveProperty('error', error);
      });
    });

    describe('INVALIDATE_QUERY', () => {
      const type = INVALIDATE_QUERY;
      const endpointName = 'sample-endpoint';
      const query = '{a{b}}';
      const queryHash = hash(query);

      it('removes the query entry from the query map', () => {
        const originalState = new ImmutableMap({
          endpoints: new ImmutableMap({
            [endpointName]: new ImmutableMap({
              queries: new ImmutableMap({
                [queryHash]: new ImmutableMap({
                  typenames: new ImmutableSet(['A']),
                  variables: new ImmutableMap({
                    [hash(null)]: new ImmutableMap({
                      status: 'complete',
                      data: { a: { b: 'hello' } },
                    }),
                  }),
                }),
              }),
            }),
          }),
        });
        const firstState = reducer(originalState, { type, endpointName, query });
        expect(firstState.getIn(['endpoints', endpointName, 'queries', queryHash])).toEqual(undefined);
      });
    });

    describe('MUTATION_STARTED', () => {
      const type = MUTATION_STARTED;

      it('does not change the state', () => {
        const originalState = new ImmutableMap({
          queries: new ImmutableMap({}),
        });
        const nextState = reducer(originalState, { type });
        expect(nextState).toBe(originalState);
      });
    });

    describe('MUTATION_FINISHED', () => {
      const type = MUTATION_FINISHED;

      it('does not throw when there are no query entries for the endpoint', () => {
        const endpointName = 'sample-endpoint';
        const originalState = new ImmutableMap({
          endpoints: new ImmutableMap({}),
        });
        const nextState = reducer(originalState, { type, endpointName, typenames: ['Counter', 'Offer'] });
        expect(nextState.getIn(['endpoints', endpointName, 'queries']).isEmpty()).toBe(true);
      });

      it('does not change the state when no query entries have a typename the mutation affected', () => {
        const endpointName = 'sample-endpoint';
        const queryHash = hash('{a{b{c}}}');
        const originalState = new ImmutableMap({
          endpoints: new ImmutableMap({
            [endpointName]: new ImmutableMap({
              queries: new ImmutableMap({
                [queryHash]: new ImmutableMap({
                  typenames: new ImmutableSet(['A', 'B']),
                  variables: new ImmutableMap({
                    [hash(null)]: new ImmutableMap({
                      status: 'complete',
                      data: { a: { b: { c: 'hello' } } },
                    }),
                  }),
                }),
              }),
            }),
          }),
        });
        const nextState = reducer(originalState, { type, endpointName, typenames: ['Counter', 'Offer'] });
        expect(nextState).toBe(originalState);
      });

      it('removes query entries that have a typename the mutation affected', () => {
        const endpointName = 'sample-endpoint';
        const queryHash = hash('{b,offer{canRefuse}}');
        const originalState = new ImmutableMap({
          endpoints: new ImmutableMap({
            [endpointName]: new ImmutableMap({
              queries: new ImmutableMap({
                [queryHash]: new ImmutableMap({
                  typenames: new ImmutableSet(['B', 'Offer']),
                  variables: new ImmutableMap({
                    [hash(null)]: new ImmutableMap({
                      status: 'complete',
                      data: { b: 'distraction', offer: { canRefuse: false } },
                    }),
                  }),
                }),
              }),
            }),
          }),
        });
        const nextState = reducer(originalState, { type, endpointName, typenames: ['Counter', 'Offer'] });
        expect(ImmutableMap.isMap(nextState.getIn(['endpoints', endpointName, 'queries']))).toBe(true);
        expect(nextState.getIn(['endpoints', endpointName, 'queries', queryHash])).not.toBeDefined();
      });

      it('does not change the state when a mutation has no typenames supplied', () => {
        const endpointName = 'sample-endpoint';
        const queryHash = hash('{b,offer{canRefuse}}');
        const originalState = new ImmutableMap({
          endpoints: new ImmutableMap({
            [endpointName]: new ImmutableMap({
              queries: new ImmutableMap({
                [queryHash]: new ImmutableMap({
                  typenames: new ImmutableSet(['B', 'Offer']),
                  variables: new ImmutableMap({
                    [hash(null)]: new ImmutableMap({
                      status: 'complete',
                      data: { b: 'distraction', offer: { canRefuse: false } },
                    }),
                  }),
                }),
              }),
            }),
          }),
        });
        const nextState = reducer(originalState, { type, endpointName });
        expect(nextState).toBe(originalState);
      });
    });

    describe('MUTATION_ERROR', () => {
      const type = MUTATION_ERROR;
      const query = `
        mutation incrementTheCounter($by: Int){
          incrementCounter(by: $by) {
            count
            offer {
              canRefuse
            }
          }
        }
      `;

      it('does not change the state', () => {
        const originalState = new ImmutableMap({
          endpoints: new ImmutableMap({}),
        });
        const nextState = reducer(originalState, { type, endpointName: 'sample-endpoint', query });
        expect(nextState).toBe(originalState);
      });
    });
  });
});
