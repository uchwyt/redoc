/* tslint:disable:no-implicit-dependencies */

import React from 'react';
import { renderToString } from 'react-dom/server';
import yaml from 'js-yaml';
import { createStore, Redoc } from '../';

import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('SSR', () => {
  it('should render in SSR mode', async () => {
    const spec = yaml.load(readFileSync(resolve(__dirname, '../../demo/openapi.yaml'), 'utf-8'));
    const store = await createStore(spec, '');
    expect(() => {
      renderToString(<Redoc store={store} />);
    }).not.toThrow();
  });
});
