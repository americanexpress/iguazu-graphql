import 'fetch-everywhere';
import { clearQueryData } from '../src';
import { CLEAR_QUERY } from '../src/duck/types';

describe('clearQueryData', () => {
  it('is a function', () => {
    expect(clearQueryData).toEqual(expect.any(Function));
  });

  it('returns the formatted action', () => {
    const variables = { param: 'value' };
    const endpointName = 'some-endpoint';
    const query = '{a{b}}';

    const queryInfo = { endpointName, query, variables };

    expect(clearQueryData(queryInfo)).toEqual({ type: CLEAR_QUERY, ...queryInfo });
  });
});
