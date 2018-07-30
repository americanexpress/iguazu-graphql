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

import graphqlReducer from '../src/duck/reducer';
import { configureIguazuGraphQL } from '../src/config';
// import gql from '../src/gql';
import addGraphQLEndpoints from '../src/addGraphQLEndpoints';
import queryGraphQLData from '../src/useGraphQLData/query';
import mutateGraphQLData from '../src/useGraphQLData/mutate';

import * as index from '../src';

describe('index', () => {
  it('exports the redux reducer as graphqlReducer', () => expect(index.graphqlReducer).toBe(graphqlReducer));
  it('exports configureIguazuGraphQL', () => expect(index.configureIguazuGraphQL).toBe(configureIguazuGraphQL));
  // it('exports gql');
  it('exports addGraphQLEndpoints', () => expect(index.addGraphQLEndpoints).toBe(addGraphQLEndpoints));
  it('exports queryGraphQLData', () => expect(index.queryGraphQLData).toBe(queryGraphQLData));
  it('exports mutateGraphQLData', () => expect(index.mutateGraphQLData).toBe(mutateGraphQLData));
});
