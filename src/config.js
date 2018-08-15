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

const endpoints = new Map();

// function addEndpoint({ name, ...opts }) {
function addEndpoint(name, opts) {
  // const { name } = opts;
  if (!name || typeof name !== 'string') {
    throw new Error(`name must be a string (was ${name ? typeof name : 'falsey'})`);
  }

  if (endpoints.has(name)) {
    throw new Error(`cannot override existing config for ${name}`);
  }

  endpoints.set(name, opts);
}

function getEndpoint(name) {
  if (!endpoints.has(name)) {
    throw new Error(`${name} is not a configured endpoint`);
  }
  // return {
  //   ...endpoints.get(name),
  //   name,
  // };
  return endpoints.get(name);
}

const config = {
  baseFetch: fetch,
  // don't like the name, but it's part of iguazu-rest so it's consistent 😬
  getToState: state => state.iguazuGraphQL,
  addEndpoint,
  getEndpoint,
};

export function configureIguazuGraphQL(customConfig) {
  Object.assign(config, customConfig, { addEndpoint, getEndpoint });
}

export default config;
