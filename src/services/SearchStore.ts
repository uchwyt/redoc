import type { IMenuItem } from './types';
import type { OperationModel } from './models';
import {dispose, done, add, search, toJS, fromExternalJS, load} from './SearchWorker.worker';

export class SearchStore<T> {
  indexItems(groups: Array<IMenuItem | OperationModel>) {
    const recurse = items => {
      items.forEach(group => {
        if (group.type !== 'group') {
          this.add(group.name, (group.description || '').concat(' ', group.path || ''), group.id);
        }
        recurse(group.items);
      });
    };

    recurse(groups);
    done();
  }

  add(title: string, body: string, meta?: T) {
    add(title, body, meta);
  }

  dispose() {
    dispose();
  }

  search(q: string) {
    return search<T>(q);
  }

  async toJS() {
    return toJS();
  }

  load(state: any) {
    load(state);
  }

  fromExternalJS(path?: string, exportName?: string) {
    if (path && exportName) {
      fromExternalJS(path, exportName);
    }
  }
}
