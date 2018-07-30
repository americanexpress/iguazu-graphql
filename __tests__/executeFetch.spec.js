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
import fetchMock from 'fetch-mock';
import config from '../src/config';

import {
  QUERY_STARTED, QUERY_FINISHED, QUERY_ERROR,
  MUTATION_STARTED, MUTATION_FINISHED, MUTATION_ERROR,
} from '../src/duck/types';

import executeFetch from '../src/executeFetch';

jest.mock('../src/config', () => ({
  baseFetch: jest.fn((...args) => global.fetch(...args)),
  getEndpoint: jest.fn(name => ({ name, fetch: state => ({ url: `https://${state.name}.tld/graphql` }) })),
}));

describe('executeFetch', () => {
  fetchMock.config.overwriteRoutes = true;

  beforeEach(() => {
    fetchMock.reset();
    delete config.defaultOpts;
  });

  it('is a function', () => expect(executeFetch).toBeInstanceOf(Function));

  it('returns a function', () => expect(executeFetch({})).toBeInstanceOf(Function));

  it('sends a network request to the configured endpoint', () => {
    expect.assertions(2);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 1 } } });
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][0]).toBe('https://sample-endpoint.tld/graphql');
  });

  it('sends the request as a POST by default', () => {
    expect.assertions(2);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 2 } } });
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('method', 'POST');
  });

  it('sends the request as the method configured by the iguazu-graphql config', () => {
    expect.assertions(2);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.get('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 2 } } });
    config.defaultOpts = { method: 'GET' };
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('method', 'GET');
  });

  it('sends the request as the method configured by the endpoint config', () => {
    expect.assertions(2);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.get('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 2 } } });
    config.getEndpoint.mockImplementationOnce(name => ({
      name,
      fetch: state => ({ url: `https://${state.name}.tld/graphql` }),
      opts: { method: 'GET' },
    }));
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('method', 'GET');
  });

  it('sends the request as the method configured by the endpoint config, overriding the iguazu-graphql config', () => {
    expect.assertions(2);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.put('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 2 } } });
    config.getEndpoint.mockImplementationOnce(name => ({
      name,
      fetch: state => ({ url: `https://${state.name}.tld/graphql` }),
      opts: { method: 'PUT' },
    }));
    config.defaultOpts = { method: 'GET' };
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('method', 'PUT');
  });

  it('sends the request as the method configured by the fetch config', () => {
    expect.assertions(2);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.get('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 2 } } });
    config.getEndpoint.mockImplementationOnce(name => ({
      name,
      fetch: state => ({ url: `https://${state.name}.tld/graphql`, opts: { method: 'GET' } }),
    }));
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('method', 'GET');
  });

  it('sends the request as the method configured by the fetch config, overriding the endpoint config', () => {
    expect.assertions(2);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.put('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 2 } } });
    config.getEndpoint.mockImplementationOnce(name => ({
      name,
      fetch: state => ({ url: `https://${state.name}.tld/graphql`, opts: { method: 'PUT' } }),
      opts: { method: 'GET' },
    }));
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('method', 'PUT');
  });

  it('sends the query in the body of the request', () => {
    expect.assertions(3);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 3 } } });
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('body');
    expect(JSON.parse(config.baseFetch.mock.calls[0][1].body)).toHaveProperty('query', '{a{__typename,b}}');
  });

  it('includes __typenames in the query sent', () => {
    expect.assertions(3);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 4 } } });
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('body');
    expect(config.baseFetch.mock.calls[0][1].body).toMatch('{__typename,b}');
  });

  it('sends the variables in the body of the request', () => {
    expect.assertions(4);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = { notUsed: 13 };
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 5 } } });
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('body');
    const body = JSON.parse(config.baseFetch.mock.calls[0][1].body);
    expect(body).toHaveProperty('variables');
    expect(body.variables).toEqual(variables);
  });

  it('sends the request with JSON MIME type', () => {
    expect.assertions(3);
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 6 } } });
    executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('headers');
    expect(config.baseFetch.mock.calls[0][1].headers).toHaveProperty('content-type', 'application/json');
  });

  it('request the response be sent as JSON via MIME type', async () => {
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 7 } } });
    await executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(config.baseFetch).toHaveBeenCalledTimes(1);
    expect(config.baseFetch.mock.calls[0][1]).toHaveProperty('headers');
    expect(config.baseFetch.mock.calls[0][1].headers).toHaveProperty('accepts', 'application/json');
  });

  it('dispatches a QUERY_STARTED action with details of the request', async () => {
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 8 } } });
    await executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    await config.baseFetch.mock.results[0].value;
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: QUERY_STARTED,
      endpointName,
      query,
      variables,
      promise: config.baseFetch.mock.results[0].value,
    });
  });

  it('dispatches a QUERY_FINISHED action with the data of the response', async () => {
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { a: { __typename: 'A', b: 9 } } });
    const executed = executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(executed).toBeInstanceOf(Promise);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[1][0]).toBeInstanceOf(Function);
    const thunk = dispatch.mock.calls[1][0];
    thunk(dispatch);
    await executed;
    await config.baseFetch.mock.results[0].value;
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch.mock.calls[2][0]).toEqual({
      type: QUERY_FINISHED,
      endpointName,
      data: { a: { __typename: 'A', b: 9 } },
      error: undefined,
      typenames: ['A'],
      query,
      variables,
    });
  });

  it('dispatches a QUERY_FINISHED action with the typenames from the response', async () => {
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{c{d{e}}}';
    const variables = null;
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { c: [{ __typename: 'C', d: { __typename: 'D', e: 10 } }] } });
    const executed = executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(executed).toBeInstanceOf(Promise);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[1][0]).toBeInstanceOf(Function);
    const thunk = dispatch.mock.calls[1][0];
    thunk(dispatch);
    await executed;
    await config.baseFetch.mock.results[0].value;
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch.mock.calls[2][0]).toEqual({
      type: QUERY_FINISHED,
      endpointName,
      data: { c: [{ __typename: 'C', d: { __typename: 'D', e: 10 } }] },
      error: undefined,
      typenames: ['C', 'D'],
      query,
      variables,
    });
  });

  it('dispatches a QUERY_ERROR action when the request has a network error', async () => {
    // throws
    config.baseFetch.mockClear();
    const sampleError = new Error('like a network error');
    config.baseFetch.mockImplementationOnce(() => Promise.reject(sampleError));
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    const executed = executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(executed).toBeInstanceOf(Promise);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[1][0]).toBeInstanceOf(Function);
    const thunk = dispatch.mock.calls[1][0];
    thunk(dispatch);
    try {
      await executed;
      await config.baseFetch.mock.results[0].value;
      throw new Error('mocked fetch should have rejected');
    } catch (err) {
      // noop
    }
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch.mock.calls[2][0]).toEqual({
      type: QUERY_ERROR,
      endpointName,
      error: sampleError,
      query,
      variables,
    });
  });

  it('dispatches a QUERY_ERROR action when the response status is not a success', async () => {
    config.baseFetch.mockClear();
    fetchMock.post('https://sample-endpoint.tld/graphql', {
      status: 400,
      body: { hello: 'world' },
    });
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'QUERY';
    const endpointName = 'sample-endpoint';
    const query = '{a{b}}';
    const variables = null;
    const executed = executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(executed).toBeInstanceOf(Promise);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[1][0]).toBeInstanceOf(Function);
    const thunk = dispatch.mock.calls[1][0];
    thunk(dispatch);
    let errorThrown;
    try {
      await executed;
      await config.baseFetch.mock.results[0].value;
      throw new Error('mocked fetch should have rejected');
    } catch (err) {
      errorThrown = err;
    }
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch.mock.calls[2][0]).toEqual({
      type: QUERY_ERROR,
      endpointName,
      error: errorThrown,
      query,
      variables,
    });
    expect(errorThrown).toMatchSnapshot();
  });

  it('dispatches a MUTATION_STARTED action with details of the request', async () => {
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'MUTATION';
    const endpointName = 'sample-endpoint';
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
    const variables = { by: 1 };
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { __typename: 'Counter', count: 11, offer: { __typename: 'Offer', canRefuse: false } } });
    await executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    await config.baseFetch.mock.results[0].value;
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[0][0]).toEqual({
      type: MUTATION_STARTED,
      endpointName,
      query,
      variables,
      promise: config.baseFetch.mock.results[0].value,
    });
  });

  it('dispatches a MUTATION_FINISHED action with the data of the response, including typenames', async () => {
    config.baseFetch.mockClear();
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'MUTATION';
    const endpointName = 'sample-endpoint';
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
    const variables = { by: 2 };
    fetchMock.post('https://sample-endpoint.tld/graphql', { data: { __typename: 'Counter', count: 12, offer: { __typename: 'Offer', canRefuse: false } } });
    const executed = executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(executed).toBeInstanceOf(Promise);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[1][0]).toBeInstanceOf(Function);
    const thunk = dispatch.mock.calls[1][0];
    thunk(dispatch);
    await executed;
    await config.baseFetch.mock.results[0].value;
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch.mock.calls[2][0]).toEqual({
      type: MUTATION_FINISHED,
      endpointName,
      data: { __typename: 'Counter', count: 12, offer: { __typename: 'Offer', canRefuse: false } },
      error: undefined,
      typenames: ['Counter', 'Offer'],
      query,
      variables,
    });
  });

  it('dispatches a MUTATION_ERROR action when the request has a network error', async () => {
    // throws
    config.baseFetch.mockClear();
    const sampleError = new Error('like a network error');
    config.baseFetch.mockImplementationOnce(() => Promise.reject(sampleError));
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'MUTATION';
    const endpointName = 'sample-endpoint';
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
    const variables = { by: 3 };
    const executed = executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(executed).toBeInstanceOf(Promise);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[1][0]).toBeInstanceOf(Function);
    const thunk = dispatch.mock.calls[1][0];
    thunk(dispatch);
    try {
      await executed;
      await config.baseFetch.mock.results[0].value;
      throw new Error('mocked fetch should have rejected');
    } catch (err) {
      // noop
    }
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch.mock.calls[2][0]).toEqual({
      type: MUTATION_ERROR,
      endpointName,
      error: sampleError,
      query,
      variables,
    });
  });

  it('dispatches a MUTATION_ERROR action when the response status is not a success', async () => {
    config.baseFetch.mockClear();
    fetchMock.post('https://sample-endpoint.tld/graphql', {
      status: 400,
      body: { hello: 'world' },
    });
    const dispatch = jest.fn(v => v);
    const getState = jest.fn(() => ({ name: 'sample-endpoint' }));
    const actionType = 'MUTATION';
    const endpointName = 'sample-endpoint';
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
    const variables = { by: 4 };
    const executed = executeFetch({
      actionType, endpointName, query, variables,
    })(dispatch, getState);
    expect(executed).toBeInstanceOf(Promise);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch.mock.calls[1][0]).toBeInstanceOf(Function);
    const thunk = dispatch.mock.calls[1][0];
    thunk(dispatch);
    let errorThrown;
    try {
      await executed;
      await config.baseFetch.mock.results[0].value;
      throw new Error('mocked fetch should have rejected');
    } catch (err) {
      errorThrown = err;
    }
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch.mock.calls[2][0]).toEqual({
      type: MUTATION_ERROR,
      endpointName,
      error: errorThrown,
      query,
      variables,
    });
    expect(errorThrown).toMatchSnapshot();
  });
});
