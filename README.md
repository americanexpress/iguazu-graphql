<h1 align="center">
  <img src='https://github.com/americanexpress/iguazu-graphql/raw/master/iguazu-graphql.png' alt="Iguazu GraphQL - One Amex" width='50%'/>
</h1>

[![npm](https://img.shields.io/npm/v/iguazu-graphql)](https://www.npmjs.com/package/iguazu-graphql)
[![Travis (.org) branch](https://img.shields.io/travis/americanexpress/iguazu-graphql/master)](https://travis-ci.org/americanexpress/iguazu-graphql)

> Iguazu GraphQL is a plugin for the [Iguazu](https://github.com/americanexpress/iguazu)
> ecosystem that allows for GraphQL requests backed by a simple cache.

## 👩‍💻 Hiring 👨‍💻

Want to get paid for your contributions to `iguazu-graphql`?
> Send your resume to oneamex.careers@aexp.com

## 📖 Table of Contents

* [Features](#-features)
* [Usage](#-usage)
* [Available Scripts](#-available-scripts)
* [Contributing](#-contributing)

## ✨ Features

* Plugs into [Iguazu](https://github.com/americanexpress/iguazu)
* Easy dispatchable actions for querying and mutating GraphQL APIs
* Simple caching of requests based on Query
* Seamless integration in Redux

### How it works

## 🤹‍ Usage

### Installation

```bash
npm install --save iguazu-graphql
```

### Quick Setup

You will need to add the `graphqlReducer` to your redux store ([redux-thunk](https://www.npmjs.com/package/redux-thunk) middleware is required):

```javascript
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { graphqlReducer, addGraphQLEndpoints } from 'iguazu-graphql';
import thunk from 'redux-thunk';

const store = createStore(
  combineReducers({
    iguazuGraphQL: graphqlReducer,  
  }),
  applyMiddleware(thunk)
);
// The graphqlReducer key name must be iguazuGraphQL 

addGraphQLEndpoints([
  {
    name: 'example-endpoint',
    fetch: () => ({ url: 'https://example.com/graphql' }),
  },
  // other endpoints can be specified at the same time
  // they can also be added later
]);
```

You may now call GraphQL using [Iguazu](https://github.com/americanexpress/iguazu)'s `loadDataAsProps`:

### Basic Usage

```javascript
/* MyContainer.jsx */
import React from 'react';
import { connectAsync } from 'iguazu';
import { queryGraphQLData } from 'iguazu-graphql';

function MyContainer({ isLoading, loadedWithErrors, myData }) {
  if (isLoading()) {
    return <div>Loading...</div>;
  }

  if (loadedWithErrors()) {
    return <div>Oh no! Something went wrong</div>;
  }

  return (
    <div>
      myData =
      {myData}
    </div>
  );
}

function loadDataAsProps({ store, ownProps }) {
  const { dispatch } = store;
  const endpointName = 'example-endpoint';
  const query = `
    query ($someParam: String) {
      path(someParam: $someParam) {
        to {
          data
        }
      }
    }
  `;
  const variables = { someParam: ownProps.someParam };
  return {
    myData: () => dispatch(queryGraphQLData({ endpointName, query, variables })),
  };
}

export default connectAsync({ loadDataAsProps })(MyContainer);
```

### Getting Data (Queries)

The Iguazu GraphQL adapter follows the [Iguazu](https://github.com/americanexpress/iguazu) pattern. The `queryGraphQLData` action creator handles the boilerplate of action forms (`promise`, `status`, `error`, and `data` properties) [Iguazu](https://github.com/americanexpress/iguazu) expects, while providing a convenient way to query a GraphQL schema/endpoint. The `queryGraphQLData` action creator requires a query to send to the GraphQL server, and also accepts variables for that query.

```javascript
/* MyContainer.jsx */
import React from 'react';
import { connectAsync } from 'iguazu';
import { queryGraphQLData } from 'iguazu-graphql';

function MyContainer({ isLoading, loadedWithErrors, myData }) {
  if (isLoading()) {
    return <div>Loading...</div>;
  }

  if (loadedWithErrors()) {
    return <div>Oh no! Something went wrong</div>;
  }

  return (
    <div>
      myData =
      {myData}
    </div>
  );
}

function loadDataAsProps({ store, ownProps }) {
  const { dispatch } = store;
  const endpointName = 'example-endpoint';
  const query = `
    query ($someParam: String) {
      path(someParam: $someParam) {
        to {
          data
        }
      }
    }
  `;
  const variables = { someParam: ownProps.someParam };
  return {
    myData: () => dispatch(queryGraphQLData({ endpointName, query, variables })),
  };
}

export default connectAsync({ loadDataAsProps })(MyContainer);
```

### Changing Data (Mutations)

To change data on the server, use `mutateGraphQLData` to send mutations. It is very similar to the `queryGraphQLData` action creator, using a mutation instead of a query:

```javascript
/* MyUpdatingComponent.jsx */
import React, { Component, Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { connectAsync } from 'iguazu';
import { queryGraphQLData, mutateGraphQLData } from 'iguazu-graphql';

const endpointName = 'sample-endpoint';

const QUERY_DATA = `
  query ($someParam: String) {
    path(someParam: $someParam) {
      to {
        data
      }
    }
  }
`;

const MUTATE_DATA = `
  mutation ($someParam: String) {
    removeTodo(someParam: $someParam) {
      someFunIdentifier
    }
  }
`;

class MyUpdatingComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { message: '' };
  }

  handleClick = () => {
    const { mutateData, queryData } = this.props;
    // Send mutateData request
    const { promise: mutatePromise } = mutateData({ someParam: 'someParam' });
    return mutatePromise
      .then(() => {
        // Refresh queryData to get new results
        // which retriggers loadDataAsProps on rerender to get new myData
        const { promise: queryPromise } = queryData({ someParam: 'someParam' });
        return queryPromise;
      })
      .then(() => {
        this.setState({ message: 'Success!' });
      });
  };

  render() {
    const { isLoading, loadedWithErrors, myData } = this.props;
    const { message } = this.state;

    if (isLoading()) {
      return <div>Loading...</div>;
    }

    if (loadedWithErrors()) {
      return <div>Oh no! Something went wrong</div>;
    }

    return (
      <Fragment>
        {message}
        <button type="button" onClick={this.handleClick}>Update</button>
        <h1>My Data</h1>
        {myData}
      </Fragment>
    );
  }
}

// Hook up action creator functions to props to call later
function mapDispatchToProps(dispatch) {
  return {
    // Update some remote resource
    mutateData: ({ someParam }) => dispatch(
      mutateGraphQLData({ endpointName, mutation: MUTATE_DATA, variables: { someParam } })
    ),
    // Fetch some remote resource
    queryData: ({ someParam }) => dispatch(
      queryGraphQLData({ endpointName, query: QUERY_DATA, variables: { someParam } })
    ),
  };
}

// Hook up data dispatches on component load
function loadDataAsProps({ store, ownProps }) {
  const { dispatch } = store;
  return {
    // Fetch some remote resource and inject it into props as myData
    myData: () => dispatch(
      queryGraphQLData({
        endpointName,
        query: QUERY_DATA,
        variables: { someParam: ownProps.someParam },
      })
    ),
  };
}

export default compose(
  connect(undefined, mapDispatchToProps),
  connectAsync({ loadDataAsProps })
)(MyUpdatingComponent);
```

### Advanced Setup

#### Modifying Fetch Client

The `fetch` option must return an object with a `url` key, and optionally an `opts` key of options for the fetch call (the second argument). Note that the `fetch` option for the endpoint is given the redux state, allowing computation of the URL or other options that may be needed:

```javascript
import { addGraphQLEndpoints } from 'iguazu-graphql';

addGraphQLEndpoints([
  {
    name: 'example-endpoint',

    fetch: (state) => ({
      // the first argument to `fetch`
      url: `https://${state.config.myDomainForData}/graphql`,

      // the second argument to `fetch`
      opts: {
        // the base headers of `content-type` and `accepts` remain as opts are deeply merged
        headers: { 'X-CSRF': state.config.csrfToken },
      },
    }),

    // can also provide static opts, but overridden (via merge) by the `opts` returned by `fetch`
    opts: {
      headers: { 'API-Token': 'twelve' },
    },
  },
]);
```

The Iguazu GraphQL adapter can be further configured via `configureIguazuGraphQL`:

```javascript
import { configureIguazuGraphQL } from 'iguazu-graphql';

configureIguazuGraphQL({
  // extend fetch with some added functionality
  baseFetch: fetchWith6sTimeout,

  // override state location, defaults to state.iguazuGraphQL
  getToState: (state) => state.iguazuGraphQL,

  // default overrides of the Iguazu GraphQL defaults, like using POST
  // the endpoint `opts` takes precedence, see `src/executeFetch.js getAsyncData()` for details
  defaultOpts: {
    method: 'GET',
  },
});
```

**Note:** The `baseFetch` option is overriden if `fetchClient` is set with Redux
Thunk's withExtraArgument. (See [Advanced Setup](#advanced-setup) for details)

#### Placing State in a Different Location

If you have a different place you want to put the query cache, you can put the reducer in that location in the redux pattern and then tell Iguazu GraphQL where that is via the `getToState` key to `configureIguazuGraphQL`:

```javascript
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { graphqlReducer, configureIguazuGraphQL } from 'iguazu-graphql';
import thunk from 'redux-thunk';

const store = createStore(
  combineReducers({
    deep: combineReducers({
      deeper: combineReducers({
        deepEnough: graphqlReducer,
      }),
    }),
  }),
  applyMiddleware(thunk)
);

configureIguazuGraphQL({ getToState: (state) => state.deep.deeper.deepEnough });
```

## 📜 Available Scripts

**`npm run lint`**

Verifies that your code matches the American Express code style defined in
[`eslint-config-amex`](https://github.com/americanexpress/eslint-config-amex).

**`npm run build`**

Runs `babel` to compile `src` files to transpiled JavaScript into `lib` using
[`babel-preset-amex`](https://github.com/americanexpress/babel-preset-amex).

**`npm test`**

Runs unit tests **and** verifies the format of all commit messages on the current branch.

**`npm posttest`**

Runs linting on the current branch.

## 🎣 Git Hooks

These commands will be automatically run during normal git operations like committing code.

**`pre-commit`**

This hook runs `npm test` before allowing a commit to be checked in.

**`commit-msg`**

This hook verifies that your commit message matches the One Amex conventions. See the **commit
message** section in the [contribution guidelines](./CONTRIBUTING.md).

## 🏆 Contributing

We welcome Your interest in the American Express Open Source Community on Github.
Any Contributor to any Open Source Project managed by the American Express Open
Source Community must accept and sign an Agreement indicating agreement to the
terms below. Except for the rights granted in this Agreement to American Express
and to recipients of software distributed by American Express, You reserve all
right, title, and interest, if any, in and to Your Contributions. Please [fill
out the Agreement](https://cla-assistant.io/americanexpress/iguazu-graphql).

Please feel free to open pull requests and see [CONTRIBUTING.md](./CONTRIBUTING.md) for commit formatting details.

## 🗝️ License

Any contributions made under this project will be governed by the [Apache License
2.0](./LICENSE.txt).

## 🗣️ Code of Conduct

This project adheres to the [American Express Community Guidelines](./CODE_OF_CONDUCT.md).
By participating, you are expected to honor these guidelines.
