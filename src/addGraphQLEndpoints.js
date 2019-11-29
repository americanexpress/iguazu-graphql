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

import config from './config';

function addGraphQLEndpoint({ name, fetch, opts }) {
  if (!name || typeof name !== 'string') {
    throw new Error(`required param name must be a string (was ${name ? typeof name : 'falsey'})`);
  }

  if (!fetch || (typeof fetch !== 'function')) {
    throw new Error(`required param fetch must be a function (was ${typeof fetch})`);
  }

  if (opts && typeof opts !== 'object') {
    throw new Error(`param opts must be an object (was ${typeof opts})`);
  }

  config.addEndpoint(name, { fetch, opts });
}

export default function addGraphQLEndpoints(arg) {
  const endpoints = Array.isArray(arg) ? arg : [arg];
  endpoints.forEach((endpoint) => addGraphQLEndpoint(endpoint));
}
