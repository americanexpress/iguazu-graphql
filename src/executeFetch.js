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

import merge from 'deepmerge';

import config from './config';
import * as types from './duck/types';
import addTypeNamesToQuery from './gql/addTypeNamesToQuery';

function findTypenames(obj, typenames = []) {
  if (!obj || typeof obj !== 'object') {
    return typenames;
  }

  if (Array.isArray(obj)) {
    obj.forEach(field => findTypenames(field, typenames));
  } else {
    Object.entries(obj).forEach(([key, val]) => {
      if (key === '__typename') {
        typenames.push(val);
      } else {
        findTypenames(val, typenames);
      }
    });
  }

  return typenames;
}

async function extractDataFromResponse(res) {
  const body = await res.json();
  const { status } = res;

  if (!res.ok) {
    return Promise.reject(Object.assign(new Error(`${res.statusText} (${res.url})`), { body, status }));
  }

  const { data, errors } = body;
  const typenames = findTypenames(data).filter((v, i, a) => i === a.indexOf(v));

  return Promise.resolve({ data, errors, typenames });
}

async function getAsyncData({
  endpointName, getState, query, variables,
}) {
  const { defaultOpts = {} } = config;
  const { fetch, opts: endpointOpts = {} } = config.getEndpoint(endpointName);
  const { url, opts: fetchOpts = {} } = fetch(getState());
  const { baseFetch } = config;
  const queryWithTypeNames = addTypeNamesToQuery(query);

  const mergedOpts = merge.all([
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accepts: 'application/json',
      },
    },
    defaultOpts,
    endpointOpts,
    fetchOpts,
    {
      body: JSON.stringify({
        query: queryWithTypeNames,
        variables,
      }),
    },
  ]);

  const res = await baseFetch(url, mergedOpts);
  return extractDataFromResponse(res);
}

function waitAndDispatchFinished(promise, action) {
  return async (dispatch) => {
    try {
      const { data, errors, typenames } = await promise;
      dispatch(Object.assign({}, action, {
        type: types[`${action.type}_FINISHED`], data, error: errors, typenames,
      }));
    } catch (error) {
      dispatch(Object.assign({}, action, { type: types[`${action.type}_ERROR`], error }));
    }
  };
}

export default function executeFetch({
  actionType, endpointName, query, variables,
}) {
  return (dispatch, getState) => {
    const promise = getAsyncData({
      endpointName, getState, query, variables,
    });
    dispatch({
      type: types[`${actionType}_STARTED`], endpointName, query, variables, promise,
    });
    dispatch(waitAndDispatchFinished(promise, {
      type: actionType, endpointName, query, variables,
    }));

    return promise;
  };
}
