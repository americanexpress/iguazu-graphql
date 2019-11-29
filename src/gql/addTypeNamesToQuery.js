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

import { parse } from 'graphql/language/parser';
import print from './print';

function addTokenName({ selections } = {}, depth = 0) {
  if (!selections) {
    return;
  }

  if (depth > 0) {
    // make sure we're not duplicating the field if it's already present
    if (!selections.some(({ kind, name }) => kind === 'Field' && name.value === '__typename')) {
      selections.unshift({
        kind: 'Field',
        name: {
          kind: 'Name',
          value: '__typename',
        },
      });
    }
  }

  selections.forEach(({ kind, name, selectionSet }) => {
    switch (kind) {
      case 'Field':
        if (!name.value.startsWith('__')) {
          addTokenName(selectionSet, depth + 1);
        }
        break;
      case 'InlineFragment':
        addTokenName(selectionSet, depth + 1);
        break;
      default:
        break;
    }
  });
}

export default function addTokenNamesToQuery(query) {
  const document = parse(query);
  document.definitions.forEach((definition) => addTokenName(definition.selectionSet));
  return print(document);
}
