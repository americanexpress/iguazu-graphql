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
import config from '../src/config';

import addGraphQLEndpoints from '../src/addGraphQLEndpoints';

describe('addGraphQLEndpoints', () => {
  it('is a function', () => expect(addGraphQLEndpoints).toBeInstanceOf(Function));

  it('throws when not given a name for the endpoint', () => {
    expect(() => addGraphQLEndpoints({})).toThrowErrorMatchingSnapshot();
  });

  it('throws when not given a name as a String for the endpoint', () => {
    expect(() => addGraphQLEndpoints({ name: 9 })).toThrowErrorMatchingSnapshot();
  });

  it('throws when not given a fetch option', () => {
    expect(() => addGraphQLEndpoints({ name: 'throws-when-not-given-a-fetch-option' })).toThrowErrorMatchingSnapshot();
  });

  it('throws when not given a Function for the fetch option', () => {
    expect(() => addGraphQLEndpoints({
      name: 'throws-when-not-given-a-Function-for-the-fetch-option',
      fetch: true,
    })).toThrowErrorMatchingSnapshot();
  });

  it('accepts a string as the name option', () => {
    expect(() => addGraphQLEndpoints({
      name: 'accepts-a-string-as-the-name-option',
      fetch: jest.fn(),
    })).not.toThrowError();
  });

  it('accepts a function as the fetch option', () => {
    expect(() => addGraphQLEndpoints({
      name: 'accepts-a-function-as-the-fetch-option',
      fetch: jest.fn(),
    })).not.toThrowError();
  });

  it('does not throw when not given an opts option', () => {
    expect(() => addGraphQLEndpoints({
      name: 'does-not-throw-when-not-given-an-opts-option',
      fetch: jest.fn(),
    })).not.toThrowError();
  });

  it('throws when not given a object as the opts option', () => {
    expect(() => addGraphQLEndpoints({
      name: 'throws-when-not-given-a-object-as-the-opts-option',
      fetch: jest.fn(),
      opts: 11,
    })).toThrowErrorMatchingSnapshot();
  });

  it('accepts an object as the opts option', () => {
    expect(() => addGraphQLEndpoints({
      name: 'accepts-an-object-as-the-opts-option',
      fetch: jest.fn(),
      opts: { headers: { 'X-CSRF': 'totally-unique' } },
    })).not.toThrowError();
  });

  it('stores the endpoint in the config', () => {
    const name = 'stores-the-endpoint-in-the-config';
    const fetch = jest.fn();
    addGraphQLEndpoints({ name, fetch });
    expect(config.getEndpoint(name)).toHaveProperty('fetch', fetch);
  });

  it('accepts an array of endpoints', () => {
    const fetch1 = jest.fn();
    const fetch2 = jest.fn();

    addGraphQLEndpoints([
      { name: 'accepts-an-array-of-endpoints-1', fetch: fetch1 },
      { name: 'accepts-an-array-of-endpoints-2', fetch: fetch2 },
    ]);
    expect(config.getEndpoint('accepts-an-array-of-endpoints-1')).toHaveProperty('fetch', fetch1);
    expect(config.getEndpoint('accepts-an-array-of-endpoints-2')).toHaveProperty('fetch', fetch2);
  });
});
