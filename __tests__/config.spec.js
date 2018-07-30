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

import config, { configureIguazuGraphQL } from '../src/config';

describe('config', () => {
  const originalGetToState = config.getToState;
  const originalBaseFetch = config.baseFetch;

  function resetConfig() {
    config.getToState = originalGetToState;
    config.baseFetch = originalBaseFetch;
  }

  it('uses the global fetch as the default baseFetch', () => {
    expect(config).toHaveProperty('baseFetch', global.fetch);
  });

  it('looks for iguazuGraphQL as the default getToState redux state branch', () => {
    expect(config).toHaveProperty('getToState', expect.any(Function));
    const stateBranch = {};
    const state = { iguazuGraphQL: stateBranch };
    expect(config.getToState(state)).toBe(stateBranch);
  });

  describe('addEndpoint', () => {
    it('throws when not provided with a name to reference the endpoint configuration', () => {
      expect(() => config.addEndpoint(null)).toThrowErrorMatchingSnapshot();
      expect(() => config.addEndpoint(6)).toThrowErrorMatchingSnapshot();
    });

    it('throws when provided with an existing name', () => {
      expect(() => config.addEndpoint('throws-when-provided-with-an-existing-name')).not.toThrowError();
      expect(() => config.addEndpoint('throws-when-provided-with-an-existing-name')).toThrowErrorMatchingSnapshot();
    });
  });

  describe('getEndpoint', () => {
    it('throws when provided with an name that does not exist', () => {
      expect(() => config.getEndpoint('throws-when-provided-with-an-name-that-does-not-exist')).toThrowErrorMatchingSnapshot();
    });
  });

  test('addEndpoint makes an endpoint configuration available to getEndpoint by the name', () => {
    const opts = { anOption: 'a value' };
    config.addEndpoint('addEndpoint-makes-an-endpoint-configuration-available-to-getEndpoint-by-the-name', opts);
    expect(config.getEndpoint('addEndpoint-makes-an-endpoint-configuration-available-to-getEndpoint-by-the-name')).toBe(opts);
  });

  describe('configureIguazuGraphQL', () => {
    beforeEach(resetConfig);

    it('changes baseFetch', () => {
      const baseFetch = jest.fn();
      configureIguazuGraphQL({ baseFetch });
      expect(config.baseFetch).toBe(baseFetch);
    });

    it('changes getToState', () => {
      const getToState = jest.fn();
      configureIguazuGraphQL({ getToState });
      expect(config.getToState).toBe(getToState);
    });

    it('cannot change addEndpoint', () => {
      const addEndpoint = jest.fn();
      configureIguazuGraphQL({ addEndpoint });
      expect(config.addEndpoint).not.toBe(addEndpoint);
    });

    it('cannot change getEndpoint', () => {
      const getEndpoint = jest.fn();
      configureIguazuGraphQL({ getEndpoint });
      expect(config.getEndpoint).not.toBe(getEndpoint);
    });
  });
});
