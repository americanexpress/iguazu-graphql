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

import print from '../../src/gql/print';

describe('print', () => {
  it('is a function', () => expect(print).toBeInstanceOf(Function));

  it('strips whitespace', () => {
    const formatted = print(parse(`{
      path {
        to {
          deep {
            place
          }
        }
      }
    }`));
    expect(formatted).toEqual('{path{to{deep{place}}}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('re-joins the tokens of a tagged template literal', () => {
    const formatted = print(parse(`
      query {
        path(ids: ["${'a'}","${'b'}"]) {
          a
        }
      }
    `));
    expect(formatted).toEqual('{path(ids:["a","b"]){a}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('strips whitespace but still delineates between fields to return', () => {
    const formatted = print(parse(`
      query ($ids:[String]) {
        path(ids: $ids) {
          sibling1
          sibling2 {
            child
          }
        }
      }
    `));
    expect(formatted).toEqual('query($ids:[String]){path(ids:$ids){sibling1,sibling2{child}}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('strips whitespace when fragments are involved', () => {
    const formatted = print(parse(`
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
    `));
    expect(formatted).toEqual('query($tokens:[String]){cardAccounts(tokens:$tokens){...someFields}}fragment someFields on CardAccount{displayName,addresses{streetAddress}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('keeps the space after the query type', () => {
    const formatted = print(parse(`
      mutation incrementTheCounter($by: Int){
        incrementCounter(by: $by) {
          now
          count
        }
      }
    `));
    expect(formatted).toEqual('mutation incrementTheCounter($by:Int){incrementCounter(by:$by){now,count}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('formats basic values', () => {
    const formatted = print(parse(`
      mutation noop {
        incrementCounter(integer: 42, float: 3.14159, string: "👋", boolean: true, booleanAgain: false, nulled: null, list: [1,2]) {
          now
          count
        }
      }
    `));
    expect(formatted).toEqual('mutation noop{incrementCounter(integer:42,float:3.14159,string:"👋",boolean:true,booleanAgain:false,nulled:null,list:[1,2]){now,count}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('formats non-null types in queries', () => {
    const formatted = print(parse(`
      query DroidById($id: ID!) {
        droid(id: $id) {
          name
        }
      }
    `));
    expect(formatted).toEqual('query DroidById($id:ID!){droid(id:$id){name}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('formats object values', () => {
    const formatted = print(parse(`
      mutation CreateObject {
        hero(obj: {a:3}) {
          a
        }
      }
    `));
    expect(formatted).toEqual('mutation CreateObject{hero(obj:{a:3}){a}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('formats directives', () => {
    const formatted = print(parse(`
      query Hero($episode: Episode, $withFriends: Boolean!) {
        hero(episode: $episode) {
          name
          friends @include(if: $withFriends) {
            name
          }
        }
      }
    `));
    expect(formatted).toEqual('query Hero($episode:Episode,$withFriends:Boolean!){hero(episode:$episode){name,friends@include(if:$withFriends){name}}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('formats default variables', () => {
    const formatted = print(parse(`
      query HeroNameAndFriends($episode: Episode = JEDI) {
        hero(episode: $episode) {
          name
          friends {
            name
          }
        }
      }
    `));
    expect(formatted).toEqual('query HeroNameAndFriends($episode:Episode=JEDI){hero(episode:$episode){name,friends{name}}}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('removes comments and descriptions', () => {
    const formatted = print(parse(`
      {
        # some thoughts
        a
      }
    `));
    expect(formatted).toEqual('{a}');
    expect(() => parse(formatted)).not.toThrowError();
  });

  it('formats block strings', () => {
    const formatted = print(parse(`
      mutation noop {
        incrementCounter(
          string: "👋"
          reallLongString: """super callie fragile simplistic extra a11y duchess"""
          asdf:"""\tg\t"""
        ) {
          now
          count
        }
      }
    `));
    expect(formatted).toEqual('mutation noop{incrementCounter(string:"👋",reallLongString:"""\nsuper callie fragile simplistic extra a11y duchess\n""",asdf:"""\tg\t"""){now,count}}');
    expect(() => parse(formatted)).not.toThrowError();
  });
});
