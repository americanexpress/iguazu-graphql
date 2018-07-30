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

import { parse } from 'graphql';

import addTypeNamesToQuery from '../../src/gql/addTypeNamesToQuery';

describe('addTypeNamesToQuery', () => {
  it('should add __typename to each object in a simple query', () => {
    const formatted = addTypeNamesToQuery('{a{b,c}}');
    expect(formatted).toEqual('{a{__typename,b,c}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('should add __typename to each object in a deeply nested query', () => {
    const formatted = addTypeNamesToQuery('{a{b{c{d{e}f{g}}}}}');
    // expect ...e}f{... instead of ...e},f{... but there's an extra comma for now
    expect(formatted).toEqual('{a{__typename,b{__typename,c{__typename,d{__typename,e},f{__typename,g}}}}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('should not add duplicate __typename fields to objects', () => {
    const formatted = addTypeNamesToQuery('{a{b{c,__typename}}}');
    expect(formatted).toEqual('{a{__typename,b{c,__typename}}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('should add __typename to fields in a Fragment', () => {
    const formatted = addTypeNamesToQuery(`
      query ($tokens:[String]) {
        cardAccounts(tokens: $tokens) {
          ...someFields
        }
      }

      fragment someFields on CardAccount {
        displayName
        addresses{
          streetAddress
        }
      }
    `);
    expect(formatted).toEqual('query($tokens:[String]){cardAccounts(tokens:$tokens){__typename,...someFields}}fragment someFields on CardAccount{displayName,addresses{__typename,streetAddress}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('should add __typename to fields in an InlineFragment', () => {
    const formatted = addTypeNamesToQuery(`
      query ($tokens:[String]) {
        cardAccounts(tokens: $tokens) {
          __typename
          displayName
          ... on CardAccount {
             addresses {
              streetAddress
            }
          }
        }
      }
    `);
    expect(formatted).toEqual('query($tokens:[String]){cardAccounts(tokens:$tokens){__typename,displayName,... on CardAccount {__typename,addresses{__typename,streetAddress}}}}');
    expect(() => parse(formatted)).not.toThrowError();
  });
});
