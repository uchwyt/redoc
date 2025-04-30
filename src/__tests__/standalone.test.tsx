/* tslint:disable:no-implicit-dependencies */
import { mount } from 'enzyme';
import React from 'react';
import yaml from 'js-yaml';

import { readFileSync } from 'fs';
import { resolve } from 'path';

import { Loading, RedocStandalone } from '../components/';

describe('Components', () => {
  describe('RedocStandalone', () => {
    test('should show loading first', () => {
      const spec = yaml.load(readFileSync(resolve(__dirname, '../../demo/openapi.yaml'), 'utf-8'));

      const inst = mount(<RedocStandalone spec={spec} options={{}} />);
      expect(inst.find(Loading)).toHaveLength(1);
    });
  });
});
