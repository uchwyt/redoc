import React from 'react';
import styled, { css, keyframes } from '../styled-components';
import { ShelfIcon } from './shelfs';
import { useCallback, useState } from 'react';

const Header = styled.div<{ expanded?: boolean }>`
  position: relative;
  z-index: 1;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  cursor: pointer;
  border-radius: ${({ expanded }) => (expanded ? '8px 8px 0 0' : '8px')};
  pointer-events: auto;

  padding: 10px 20px;
  line-height: 30px;
  background-color: rgb(50, 63, 75);
  min-height: 50px;
`;

export const SectionHeaderText = styled.div`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  > span {
    line-height: 1;
    margin-right: 4px;
    font-weight: 700;
    color: rgb(245, 247, 250);
  }
`;

const expand = keyframes`
  0% {
    max-height: 0;
  }
  100% {
    max-height: unset;
  }
`;

const collapse = keyframes`
  0% {
    max-height: unset;
  }
  100% {
    max-height: 0;
  }
`;

export const SectionContent = styled.div<{ expanded?: boolean }>`
  animation: 0.2s ease ${collapse};
  visibility: hidden;
  border-radius: 0 0 8px 8px;
  background-color: rgb(82, 96, 109);
  color: rgb(245, 247, 250);
  max-height: 0;
  overflow: hidden;

  ${({ expanded }) =>
    expanded &&
    css`
      padding: 10px 20px 20px;
      animation: 0.2s ease ${expand};
      visibility: visible;
      max-height: unset;
    `}
`;

export interface ExpandableProps {
  defaultExpanded?: boolean;
  title: string;
  children: JSX.Element[] | JSX.Element;
}

const Expandable = ({ defaultExpanded, title, children }: ExpandableProps): JSX.Element => {
  const [expanded, setExpanded] = useState(defaultExpanded || false);

  const toggle = useCallback(() => setExpanded(old => !old), []);

  return (
    <div>
      <Header onClick={toggle} expanded={expanded}>
        <SectionHeaderText>
          <span>{title}</span>
          <ShelfIcon size="14px" color="white" direction={expanded ? 'down' : 'right'} />
        </SectionHeaderText>
      </Header>
      <SectionContent expanded={expanded}>{children}</SectionContent>
    </div>
  );
};

export default React.memo<ExpandableProps>(Expandable);
