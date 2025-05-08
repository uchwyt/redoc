import React from 'react';
import defaultTheme, { resolveTheme } from '../theme';
import {ThemeProvider} from '../styled-components';

import { PropsWithChildren } from 'react';

export default class TestThemeProvider extends React.Component<PropsWithChildren<any>> {
  render() {
    return (
      <ThemeProvider theme={resolveTheme(defaultTheme)}>
        {React.Children.only(this.props.children as any)}
      </ThemeProvider>
    );
  }
}

export function withTheme(children) {
  return <TestThemeProvider>{children}</TestThemeProvider>;
}
