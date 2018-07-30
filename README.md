Iguazu Graphql
==============

An [Iguazu](https://github.com/americanexpress/iguazu) adapter for GraphQL data.

Quick Setup
-----------

You will need to add the `graphqlReducer` to your redux store ([redux-thunk](https://www.npmjs.com/package/redux-thunk) middleware is required):

```javascript
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { graphqlReducer } from 'iguazu-graphql';
import thunk from 'redux-thunk';

const store = createStore(
  combineReducers({
    iguazuGraphQL: graphqlReducer,
  }),
  applyMiddleware(thunk)
);
```

You will also need to tell iguazu-graphql where your GraphQL endpoints are and give them names to reference later:

```javascript
import { addGraphQLEndpoints } from 'iguazu-graphql';

addGraphQLEndpoints([
  {
    name: 'example-endpoint',
    fetch: () => ({ url: 'https://example.com/graphql' }),
  },
  // other endpoints can be specified at the same time
  // they can also be added later
]);
```

Deeper configuration is available and is explained in the "Detailed Configuration" section later on.

Implementing Container Components
---------------------------------

Iguazu is designed to connect presentational components to the data they need via [redux](https://redux.js.org/basics/usage-with-react#implementing-container-components).
Iguazu has an [established pattern for loading data](https://github.com/americanexpress/iguazu) and getting information about that data using an interface of dispatching actions to middleware added to the redux store. The iguazu middleware expects an object with properties of `promise`, `status`, `error`, and finally `data`:

```javascript
/* MyContainer.jsx */
import React from 'react';
import { connectAsync } from 'iguazu';

function queryMyData(param) {
  return (dispatch, getState) => {
    const data = getState().path.to.myData[param];
    const status = data ? 'complete' : 'loading';
    const promise = data ? Promise.resolve : dispatch(fetchMyData(param));

    return { data, status, promise };
  }
}

function MyContainer({ isLoading, loadedWithErrors, myData }) => {
  if (isLoading()) {
    return <div>Loading...</div>
  }

  if (loadedWithErrors()) {
    return <div>Oh no! Something went wrong</div>
  }

  return <div>myData = {myData}</div>
}

function loadDataAsProps({ store, ownProps }) {
  const { dispatch } = store;
  return {
    myData: () => dispatch(queryMyData(ownProps.someParam)),
  }
}

export default connectAsync({ loadDataAsProps })(MyContainer);
```

### Getting Data (Queries)

The iguazu-graphql adapter follows the same pattern, simply taking the place of `queryMyData`. The `queryGraphQLData` action creator handles the boilerplate of action forms (`promise`, `status`, `error`, and `data` properties) iguazu expects, while providing a convenient way to query a GraphQL schema/endpoint. The `queryGraphQLData` action creator requires a query to send to the GraphQL server, and also accepts variables for that query.

```javascript
/* MyContainer.jsx */
import React from 'react';
import { connectAsync } from 'iguazu';
import { queryGraphQLData } from 'iguazu-graphql';

function MyContainer({ isLoading, loadedWithErrors, myData }) => {
  if (isLoading()) {
    return <div>Loading...</div>
  }

  if (loadedWithErrors()) {
    return <div>Oh no! Something went wrong</div>
  }

  return <div>myData = {myData}</div>
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
  }
}

export default connectAsync({ loadDataAsProps })(MyContainer);
```

### Changing Data (Mutations)

To change data on the server, use `mutateGraphQLData` to send mutations. It is very similar to the `queryGraphQLData` action creator, using a mutation instead of a query:

```javascript
/* MyContainer.jsx */
import React from 'react';
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
  mutation ($id: ID!) {
    removeTodo(someFunIdentifier: $id) {
      someFunIdentifier
    }
  }
`;

function MyContainer({ isLoading, loadedWithErrors, myData, dispatch }) => {
  if (isLoading()) {
    return <div>Loading...</div>
  }

  if (loadedWithErrors()) {
    return <div>Oh no! Something went wrong</div>
  }

  return (
    <div>
      <pre>myData = {myData}</pre>
      <button onClick={() => dispatch(mutateGraphQLData({ endpointName, mutation: MUTATE_DATA, variables: { id: 'twelve' } }))}>
        Change the data
      </button>  
    </div>
  );
}

function loadDataAsProps({ store, ownProps }) {
  const { dispatch } = store;
  const variables = { someParam: ownProps.someParam };
  return {
    myData: () => dispatch(queryGraphQLData({ endpointName, query: QUERY_DATA, variables })),
  }
}

export default connectAsync({ loadDataAsProps })(MyContainer);
```

Detailed Configuration
----------------------

The `fetch` option must return an object with a `url` key, and optionally an `opts` key of options for the fetch call (the second argument). Note that the `fetch` option for the endpoint is given the redux state, allowing computation of the URL or other options that may be needed:

```javascript
import { addGraphQLEndpoints } from 'iguazu-graphql';

addGraphQLEndpoints([
  {
    name: 'example-endpoint',

    fetch: state => ({
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
    }
  },
]);
```

The iguazu-graphql adapter can be further configured via `configureIguazuGraphQL`:

```javascript
import { configureIguazuGraphQL } from 'iguazu-graphql';

configureIguazuGraphQL({
  // extend fetch with some added functionality
  baseFetch: fetchWith6sTimeout,

  // override state location, defaults to state.iguazuGraphQL
  getToState: state => state.iguazuGraphQL,

  // default overrides of the iguazu-graphql defaults, like using POST
  // the endpoint `opts` takes precedence, see `src/executeFetch.js getAsyncData()` for details
  defaultOpts: {
    method: 'GET',
  }
});
```

### Example: different state location

If you have a different place you want to put the query cache, you can put the reducer in that location in the redux pattern and then tell iguazu-graphql where that is via the `getToState` key to `configureIguazuGraphQL`:

```javascript
import { createStore, combineReducers, applyMiddleware } from 'redux'
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

configureIguazuGraphQL({ getToState: state => state.deep.deeper.deepEnough });
```

## Contributing
We welcome Your interest in the American Express Open Source Community on Github.
Any Contributor to any Open Source Project managed by the American Express Open
Source Community must accept and sign an Agreement indicating agreement to the
terms below. Except for the rights granted in this Agreement to American Express
and to recipients of software distributed by American Express, You reserve all
right, title, and interest, if any, in and to Your Contributions. Please [fill
out the Agreement](https://cla-assistant.io/americanexpress/iguazu-graphql).

Please feel free to open pull requests and see [CONTRIBUTING.md](./CONTRIBUTING.md) for commit formatting details.

## License
Any contributions made under this project will be governed by the [Apache License
2.0](https://github.com/americanexpress/iguazu-graphql/blob/master/LICENSE.txt).

## Code of Conduct
This project adheres to the [American Express Community Guidelines](https://github.com/americanexpress/iguazu-graphql/blob/master/Code-of-Conduct).
By participating, you are expected to honor these guidelines.
