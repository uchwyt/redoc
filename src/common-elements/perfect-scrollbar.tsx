import React from 'react';

import PerfectScrollbarClass from 'perfect-scrollbar';

import { OptionsContext } from '../components/OptionsProvider';
import styled, { createGlobalStyle } from '../styled-components';
import { IS_BROWSER } from '../utils';
import { PropsWithChildren } from 'react';
import scrollbarStyles from 'perfect-scrollbar/css/perfect-scrollbar.css';

// Then use it conditionally
const psStyles = IS_BROWSER ? scrollbarStyles : '';

const PSStyling = createGlobalStyle`${psStyles}`;

const StyledScrollWrapper = styled.div`
  position: relative;
`;

export interface PerfectScrollbarProps extends PropsWithChildren<unknown> {
  options?: PerfectScrollbarClass.Options;
  className?: string;
  updateFn?: (fn) => void;
}

export class PerfectScrollbar extends React.Component<
  React.PropsWithChildren<PerfectScrollbarProps>
> {
  private _container: HTMLElement;
  private inst: PerfectScrollbarClass;

  componentDidMount() {
    const offset = (this._container.parentElement && this._container.parentElement.scrollTop) || 0;
    this.inst = new PerfectScrollbarClass(this._container, this.props.options || {});
    if (this._container.scrollTo) {
      this._container.scrollTo(0, offset);
    }
  }

  componentDidUpdate() {
    this.inst.update();
  }

  componentWillUnmount() {
    this.inst.destroy();
  }

  handleRef = ref => {
    this._container = ref;
  };

  render() {
    const { children, className, updateFn } = this.props;

    if (updateFn) {
      updateFn(this.componentDidUpdate.bind(this));
    }

    return (
      <>
        {psStyles && <PSStyling />}
        <StyledScrollWrapper className={`scrollbar-container ${className}`} ref={this.handleRef}>
          {children}
        </StyledScrollWrapper>
      </>
    );
  }
}

export function PerfectScrollbarWrap(
  props: PerfectScrollbarProps & { children: JSX.Element[] | JSX.Element },
) {
  return (
    <OptionsContext.Consumer>
      {options =>
        !options.nativeScrollbars ? (
          <PerfectScrollbar {...props}>{props.children}</PerfectScrollbar>
        ) : (
          <div
            style={{
              overflow: 'auto',
              overscrollBehavior: 'contain',
              msOverflowStyle: '-ms-autohiding-scrollbar',
            }}
          >
            {props.children}
          </div>
        )
      }
    </OptionsContext.Consumer>
  );
}
