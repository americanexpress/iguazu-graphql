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

// very similar to
// https://github.com/graphql/graphql-js/blob/b3787bb2ebadcc37674fe1a8a0f83de6698ea532/src/language/printer.js
// but we don't want to retain all the whitespace
// import { visit } from 'graphql'; but this pulls in the full libarary
import { visit } from 'graphql/language/visitor'; // pulls in less

/**
 * Given maybeArray, print an empty string if it is null or empty, otherwise print all items
 * together separated by separator if provided
 */
function join(maybeArray, separator) {
  return maybeArray ? maybeArray.filter(x => x).join(separator || '') : '';
}

/**
 * Given array, print each item on its own line, wrapped in a "{ }" block.
 */
function block(array) {
  // the original function looked at the length of the array, but as far as I can tell queries
  // with `{}` are a parse error, so always have the `{` `}` characters
  return `{${join(array, ',')}}`;
}

/**
 * If maybeString is not null or empty, then wrap with start and end, otherwise print an empty
 * string.
 */
function wrap(start, maybeString, end) {
  return maybeString ? start + maybeString + (end || '') : '';
}

/**
 * Print a block string in the indented block form by adding a leading and
 * trailing blank line. However, if a block string starts with whitespace and is
 * a single-line, adding a leading blank line would strip that whitespace.
 */
function printBlockString(value) {
  const escaped = value.replace(/"""/g, '\\"""');
  return (value[0] === ' ' || value[0] === '\t') && value.indexOf('\n') === -1
    ? `"""${escaped.replace(/"$/, '"\n')}"""`
    : `"""\n${escaped}\n"""`;
}

const printMinifiedDocASTReducer = {
  Name: node => node.value,
  Variable: node => `$${node.name}`,

  // Documents
  Document: node => join(node.definitions),
  OperationDefinition(node) {
    const {
      operation: op,
      name,
      selectionSet,
    } = node;
    const varDefs = wrap('(', join(node.variableDefinitions, ','), ')');
    const directives = join(node.directives);
    // Anonymous queries with no directives or variable definitions can use
    // the query short form.
    if (!name && !directives && !varDefs && op === 'query') {
      return selectionSet;
    }

    const header = name ? join([op, join([name, varDefs])], ' ') : join([op, varDefs]);
    return join([header, directives, selectionSet]);
  },
  VariableDefinition: ({ variable, type, defaultValue }) => `${variable}:${type}${wrap('=', defaultValue)}`,
  SelectionSet: ({ selections }) => block(selections),
  Field: ({
    alias, name, arguments: args, directives, selectionSet,
  }) =>
    join([
      wrap('', alias, ':') + name + wrap('(', join(args, ','), ')'),
      join(directives),
      selectionSet,
    ]),
  Argument: ({ name, value }) => `${name}:${value}`,

  // Fragments
  FragmentSpread: ({ name, directives }) =>
    `...${name}${wrap('', join(directives, ''))}`,

  InlineFragment: ({ typeCondition, directives, selectionSet }) =>
    join(
      ['...', wrap('on ', typeCondition), join(directives, ' '), selectionSet],
      ' '
    ),

  FragmentDefinition: ({
    name,
    typeCondition,
    variableDefinitions,
    directives,
    selectionSet,
  }) =>
    // Note: fragment variable definitions are experimental and may be changed
    // or removed in the future.
    `${`fragment ${name}${wrap('(', join(variableDefinitions, ','), ')')} ` +
    `on ${typeCondition}${wrap('', join(directives, ''), '')}`}${
      selectionSet}`,

  // Directive
  Directive: ({ name, arguments: args }) => `@${name}${wrap('(', join(args, ','), ')')}`,

  // Values, should keep these here or remove them to discourage hard-coding?
  IntValue: ({ value }) => value,
  FloatValue: ({ value }) => value,
  StringValue: ({ value, block: isBlockString }) => (
    isBlockString ?
      printBlockString(value) :
      JSON.stringify(value)
  ),
  BooleanValue: ({ value }) => (value ? 'true' : 'false'),
  NullValue: () => 'null',
  EnumValue: ({ value }) => value,
  ListValue: ({ values }) => `[${join(values, ',')}]`,
  ObjectValue: ({ fields }) => `{${join(fields, ',')}}`,
  ObjectField: ({ name, value }) => `${name}:${value}`,

  // Type
  NamedType: ({ name }) => name,
  ListType: ({ type }) => `[${type}]`,
  NonNullType: ({ type }) => `${type}!`,
};

export default function print(ast) {
  return visit(ast, { leave: printMinifiedDocASTReducer });
}
