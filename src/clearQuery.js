import { CLEAR_QUERY } from './duck/types';

export default function clearQuery({ endpointName, query, variables }) {
  return {
    type: CLEAR_QUERY,
    endpointName,
    query,
    variables,
  };
}
