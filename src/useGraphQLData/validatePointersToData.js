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

function validateEndpointName(fnName, endpointName) {
  if (typeof endpointName !== 'string' || !endpointName) {
    throw new Error(`${fnName} requires the endpointName argument`);
  }
}

function validateQuery(fnName, query) {
  if (typeof query !== 'string' || !query) {
    throw new Error(`${fnName} requires the query argument`);
  }
}

function validateMutation(fnName, mutation) {
  if (typeof mutation !== 'string' || !mutation) {
    throw new Error(`${fnName} requires the mutation argument`);
  }
}

function validateVariables(fnName, variables) {
  if (typeof variables !== 'object') {
    throw new Error(`${fnName} requires the variables argument to be an object`);
  }
}

export function validatePointersToQueryData({
  fnName, endpointName, query, variables,
}) {
  validateEndpointName(fnName, endpointName);
  validateQuery(fnName, query);
  validateVariables(fnName, variables);
}

export function validatePointersToMutationData({
  fnName, endpointName, mutation, variables,
}) {
  validateEndpointName(fnName, endpointName);
  validateMutation(fnName, mutation);
  validateVariables(fnName, variables);
}
