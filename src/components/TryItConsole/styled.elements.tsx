import styled, { css, keyframes } from '../../styled-components';

export const Close = styled.div`
  cursor: pointer;
  font-size: 24px;
  font-weight: bold;
  color: rgb(245, 247, 250);
`;

export const Header = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  border-radius: 8px 8px 0 0;
  pointer-events: auto;
  cursor: default;

  color: rgb(245, 247, 250);
  background-color: rgb(50, 63, 75);
  line-height: 30px;
  padding: 10px 20px;

  > div {
    display: flex;
    font-size: 12px;
  }

  button {
    margin: 0;
  }
`;

export const HeaderButton = styled.button<{ active: boolean }>`
  outline: none;
  border-color: transparent currentColor;
  border-style: solid none;
  border-width: 4px medium;
  border-image: none 100% / 1 / 0 stretch;
  text-align: center;
  min-width: 80px;
  min-height: 30px;
  font-size: 12px;
  padding: 0 10px;
  background-color: rgb(82, 96, 109);
  cursor: pointer;
  color: rgba(245, 247, 250, 0.7);

  ${props =>
    props.active &&
    css`
      background-color: rgb(71, 83, 94);
      color: rgb(245, 247, 250);
      border-color: transparent currentColor ${({ theme }) => theme.colors.primary.light};
    `}

  &:disabled {
    cursor: default;
  }

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }
`;

export const IntRequestBody = styled.div`
  flex: 1;
  padding: 20px 20px 15px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: rgb(82, 96, 109);

  .cm-editor {
    background-color: rgb(50, 63, 75) !important;
    color: rgb(245, 247, 250) !important;
    padding: 10px;
  }

  .cm-scroller {
    font-family: inherit;
    line-height: 18px;
  }
`;

export const ResponseBody = styled.div`
  flex: 1;
  padding: 20px 20px 15px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: rgb(82, 96, 109);
`;

export const StatusRow = styled.div`
  margin-bottom: 10px;
`;

export const Meta = styled.span<{ color?: string }>`
  display: inline-block;
  margin-right: 20px;
  padding: 2px 0;
  text-align: center;
  color: rgb(245, 247, 250);

  ${({ color, theme }) =>
    color &&
    css`
      color: ${(color && theme.colors.responses[color] && theme.colors.responses[color].color) ||
      color};
    `}
`;

export const HeadersSnippet = styled.pre`
  border-radius: 0 0 4px;
  overflow-x: auto;
  margin: 0;
  font: inherit;
  padding: 20px;
  background-color: rgb(50, 63, 75);
  color: rgb(245, 247, 250);
  font-size: 13px;
  white-space: pre;

  strong {
    text-transform: capitalize;
    display: inline-block;
    padding-right: 5px;
  }
`;

export const Title = styled.div`
  margin-bottom: 10px;

  &:not(:first-child) {
    margin-top: 10px;
  }
`;

export const SectionHeader = styled.div<{ expanded?: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  cursor: pointer;
  border-radius: ${({ expanded }) => (expanded ? '8px 8px 0 0' : '8px')};
  pointer-events: auto;

  color: white;
  border: 1px solid rgb(137, 148, 159);
  padding: 10px;
`;

export const Section = styled.div`
  &:not(:last-child) {
    margin-bottom: 10px;
  }
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
  background-color: rgb(62, 76, 89);
  border-color: currentColor rgb(137, 148, 159) rgb(137, 148, 159);
  border-style: none solid solid;
  border-width: 0 1px 1px;
  border-image: none 100% / 1 / 0 stretch;
  max-height: 0;
  overflow: hidden;

  ${({ expanded }) =>
    expanded &&
    css`
      padding: 15px 10px;
      animation: 0.2s ease ${expand};
      visibility: visible;
      max-height: unset;
    `}
`;

export const SectionTitle = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  color: rgb(150, 154, 154);
  font-size: 1em;
  font-weight: normal;
  text-align: left;
`;

export const Tab = styled.div`
  flex: 1;
  padding: 20px 20px 15px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: rgb(82, 96, 109);
`;
