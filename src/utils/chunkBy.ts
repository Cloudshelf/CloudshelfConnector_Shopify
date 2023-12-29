// @ts-nocheck
import * as _ from "lodash";

export function chunkBy(collection, predicate) {
  const chunks = [];
  const counts = {};
  const groups = _.groupBy(collection, predicate);
  while (Object.keys(groups).length) {
    _.forEach(groups, (group, key) => {
      const count = _.get(counts, key, 0);
      let chunk = chunks[count];
      if (!chunk) {
        chunk = [];
        chunks[count] = chunk;
      }
      chunk.push(group.pop());
      _.set(counts, key, count + 1);
      if (group.length === 0) delete groups[key];
    });
  }
  return chunks;
}
