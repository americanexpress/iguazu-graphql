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

import 'fetch-everywhere';
import { Map as ImmutableMap, Set as ImmutableSet } from 'immutable';
import hash from 'object-hash';
import executeFetch from '../../src/executeFetch';

import queryGraphQLData from '../../src/useGraphQLData/query';

jest.mock('../../src/executeFetch', () => jest.fn(() => Promise.resolve('executing fetch')));

describe('queryGraphQLData', () => {
  it('is a function', () => expect(queryGraphQLData).toBeInstanceOf(Function));

  it('requires an endpointName', () => {
    expect(() => queryGraphQLData({})).toThrowErrorMatchingSnapshot();
  });

  it('requires a query', () => {
    expect(() => queryGraphQLData({
      endpointName: 'sample-endpoint',
    })).toThrowErrorMatchingSnapshot();
  });

  it('requires variables to be an object', () => {
    expect(() => queryGraphQLData({
      endpointName: 'sample-endpoint',
      query: '{a{b}}',
      variables: true,
    })).toThrowErrorMatchingSnapshot();
  });

  it('returns a function', () => {
    expect(queryGraphQLData({
      endpointName: 'sample-endpoint',
      query: '{a{b}}',
    })).toBeInstanceOf(Function);
  });

  it('returns the existing status of a cached query fetch', () => {
    executeFetch.mockClear();
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const dispatch = jest.fn();
    const cachedFetchStatus = new ImmutableMap({
      status: 'complete',
      data: { a: { b: 'hello' } },
    });
    const getState = () => ({
      iguazuGraphQL: new ImmutableMap({
        endpoints: new ImmutableMap({
          [endpointName]: new ImmutableMap({
            queries: new ImmutableMap({
              [hash(query)]: new ImmutableMap({
                typenames: new ImmutableSet(['A']),
                variables: new ImmutableMap({
                  [hash(null)]: cachedFetchStatus,
                }),
              }),
            }),
          }),
        }),
      }),
    });
    const thunk = queryGraphQLData({ endpointName, query });
    const iguazuData = thunk(dispatch, getState);
    expect(dispatch).not.toHaveBeenCalled();
    expect(executeFetch).not.toHaveBeenCalled();
    expect(iguazuData).toEqual(cachedFetchStatus.toJS());
  });

  it('returns the existing status of a cached query with variables fetch', () => {
    executeFetch.mockClear();
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = { c: 3 };
    const dispatch = jest.fn();
    const cachedFetchStatus = new ImmutableMap({
      status: 'complete',
      data: { a: { b: 'hello' } },
    });
    const getState = () => ({
      iguazuGraphQL: new ImmutableMap({
        endpoints: new ImmutableMap({
          [endpointName]: new ImmutableMap({
            queries: new ImmutableMap({
              [hash(query)]: new ImmutableMap({
                typenames: new ImmutableSet(['A']),
                variables: new ImmutableMap({
                  [hash(variables)]: cachedFetchStatus,
                }),
              }),
            }),
          }),
        }),
      }),
    });
    const thunk = queryGraphQLData({ endpointName, query, variables });
    const iguazuData = thunk(dispatch, getState);
    expect(dispatch).not.toHaveBeenCalled();
    expect(executeFetch).not.toHaveBeenCalled();
    expect(iguazuData).toEqual(cachedFetchStatus.toJS());
  });

  it('returns a new fetch when forceFetch is true and cache is valid', () => {
    executeFetch.mockClear();
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = { c: 3 };
    const forceFetch = true;
    const dispatch = jest.fn((v) => v);
    const cachedFetchStatus = new ImmutableMap({
      status: 'complete',
      data: { a: { b: 'hello' } },
    });
    const getState = () => ({
      iguazuGraphQL: new ImmutableMap({
        endpoints: new ImmutableMap({
          [endpointName]: new ImmutableMap({
            queries: new ImmutableMap({
              [hash(query)]: new ImmutableMap({
                typenames: new ImmutableSet(['A']),
                variables: new ImmutableMap({
                  [hash(variables)]: cachedFetchStatus,
                }),
              }),
            }),
          }),
        }),
      }),
    });
    const thunk = queryGraphQLData({
      endpointName,
      query,
      variables,
      forceFetch,
    });
    const iguazuData = thunk(dispatch, getState);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(executeFetch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toBeInstanceOf(Promise);
    expect(iguazuData).toEqual({
      promise: dispatch.mock.calls[0][0],
      status: 'loading',
    });
  });

  it('dispatches a new fetch when a cached query fetch is not found', () => {
    executeFetch.mockClear();
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = { c: 3 };
    const dispatch = jest.fn((v) => v);
    const getState = () => ({
      iguazuGraphQL: new ImmutableMap({
        endpoints: new ImmutableMap(),
      }),
    });
    const thunk = queryGraphQLData({ endpointName, query, variables });
    const iguazuData = thunk(dispatch, getState);
    expect(executeFetch).toHaveBeenCalledTimes(1);
    expect(executeFetch.mock.calls[0][0]).toEqual({
      actionType: 'QUERY',
      endpointName,
      query,
      variables,
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toBeInstanceOf(Promise);
    expect(iguazuData).toEqual({
      promise: dispatch.mock.calls[0][0],
      status: 'loading',
    });
  });
});
