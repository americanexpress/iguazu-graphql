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

import executeFetch from '../../src/executeFetch';

import mutateGraphQLData from '../../src/useGraphQLData/mutate';

jest.mock('../../src/executeFetch', () => jest.fn(() => Promise.resolve('executing fetch')));

describe('mutateGraphQLData', () => {
  const mutation = `
    mutation incrementTheCounter($by: Int){
      incrementCounter(by: $by) {
        count
        offer {
          canRefuse
        }
      }
    }
  `;

  it('is a function', () => expect(mutateGraphQLData).toBeInstanceOf(Function));

  it('requires an endpointName', () => {
    expect(() => mutateGraphQLData({})).toThrowErrorMatchingSnapshot();
  });

  it('requires a mutation', () => {
    expect(() => mutateGraphQLData({
      endpointName: 'sample-endpoint',
    })).toThrowErrorMatchingSnapshot();
  });

  it('requires variables to be an object', () => {
    expect(() => mutateGraphQLData({
      endpointName: 'sample-endpoint',
      mutation,
      variables: true,
    })).toThrowErrorMatchingSnapshot();
  });

  it('returns a function', () => {
    expect(mutateGraphQLData({
      endpointName: 'sample-endpoint',
      mutation,
    })).toBeInstanceOf(Function);
  });


  it('dispatches a new fetch', () => {
    executeFetch.mockClear();
    const variables = { by: 2 };
    const dispatch = jest.fn(v => v);
    const thunk = mutateGraphQLData({ endpointName: 'endpoint-name', mutation, variables });
    thunk(dispatch);
    expect(executeFetch).toHaveBeenCalledTimes(1);
    expect(executeFetch.mock.calls[0][0]).toEqual({
      actionType: 'MUTATION',
      endpointName: 'endpoint-name',
      query: mutation,
      variables,
    });
  });

  it('dispatches a new fetch defaulting to variables of null', () => {
    executeFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const thunk = mutateGraphQLData({ endpointName: 'endpoint-name', mutation });
    thunk(dispatch);
    expect(executeFetch).toHaveBeenCalledTimes(1);
    expect(executeFetch.mock.calls[0][0]).toEqual({
      actionType: 'MUTATION',
      endpointName: 'endpoint-name',
      query: mutation,
      variables: null,
    });
  });

  it('dispatches the thunk from executeFetch', () => {
    executeFetch.mockClear();
    const variables = { by: 2 };
    const dispatch = jest.fn(v => v);
    const thunk = mutateGraphQLData({ endpointName: 'endpoint-name', mutation, variables });
    thunk(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toBeInstanceOf(Promise);
  });

  it('returns the iguazu interface data', () => {
    executeFetch.mockClear();
    const variables = { by: 2 };
    const dispatch = jest.fn(v => v);
    const thunk = mutateGraphQLData({ endpointName: 'endpoint-name', mutation, variables });
    const iguazuData = thunk(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(iguazuData).toEqual({
      promise: dispatch.mock.calls[0][0],
      status: 'loading',
    });
  });
});
