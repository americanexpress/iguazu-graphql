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

import executeFetch from '../executeFetch';
import { validatePointersToMutationData } from './validatePointersToData';

const actionType = 'MUTATION';
const fnName = 'mutateGraphQLData';

export default function mutateGraphQLData({ endpointName, mutation, variables = null }) {
  validatePointersToMutationData({
    fnName, endpointName, mutation, variables,
  });

  return (dispatch) => {
    const promise = dispatch(executeFetch({
      actionType,
      endpointName,
      query: mutation,
      variables,
    }));

    return {
      promise,
      status: 'loading',
    };
  };
}
