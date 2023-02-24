import styled, { css } from '../../styled-components';

export const OperationEndpointWrap = styled.div<{
  $expanded?: boolean;
  $inverted?: boolean;
  $tryItExpanded?: boolean;
}>`
  cursor: pointer;
  position: relative;
  padding: 10px 20px;
  line-height: 30px;
  min-height: 50px;
  background-color: ${props => (props.$inverted ? 'transparent' : 'rgb(50, 63, 75)')};

  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: auto;
  border-radius: 8px;
  ${props =>
    props.$expanded &&
    css`
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    `}

  ${props =>
    props.$tryItExpanded &&
    css`
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    `}
`;

export const ServerRelativeURL = styled.span<{ $wrap?: boolean }>`
  margin: 0 4px;
  color: rgb(245, 247, 250);
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-wrap: normal;
  display: inline-block;
  max-height: 90px;
  word-break: break-all;

  ${props =>
    props.$wrap &&
    css`
      white-space: normal;
      overflow-wrap: anywhere;
    `}
`;

export const EndpointInfo = styled.span`
  display: inline-flex;
  align-items: center;
  overflow-x: hidden;
  padding-right: 4px;

  &:focus {
    box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.45), 0 2px 0 rgba(128, 128, 128, 0.25);
  }
`;

export const HttpVerb = styled.span.attrs((props: { type: string; $compact?: boolean }) => ({
  className: `http-verb ${props.type}`,
}))<{ type: string; $compact?: boolean }>`
  font-size: ${props => (props.$compact ? '0.8em' : '12px')};
  line-height: ${props => (props.$compact ? '18px' : '20px')};
  background-color: ${props => props.theme.colors.http[props.type] || '#999999'};
  color: rgb(245, 247, 250);
  display: inline-block;
  text-align: center;
  padding: ${props => (props.$compact ? '2px 8px' : '0 8px')};
  text-transform: uppercase;
  font-family: ${props => props.theme.typography.headings.fontFamily};
  margin: 0;
  border-radius: 16px;
  min-width: 58px;
  font-weight: 600;
`;

export const Servers = styled.div>`
  padding: 10px 20px 20px;
  background: ${props => props.theme.rightPanel.servers.overlay.backgroundColor};
  color: ${props => props.theme.rightPanel.servers.overlay.textColor};
  border-radius: 0 0 8px 8px;
  box-sizing: border-box;
  transition: all 0.25s ease;
`;

export const ServerItem = styled.div`
  padding: 10px;
`;

export const ServerUrl = styled.div`
  padding: 5px;
  border: 1px solid #ccc;
  background: ${props => props.theme.rightPanel.servers.url.backgroundColor};
  word-break: break-all;
  color: ${props => props.theme.colors.primary.main};
  > span {
    color: ${props => props.theme.colors.text.primary};
  }
`;

export const TryItButton = styled.button`
  width: auto;
  text-decoration: none;
  text-align: center;
  outline: none;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.25s ease 0s, border-color 0.25s ease 0s, box-shadow 0.25s ease 0s;
  line-height: 1;
  font-family: inherit;
  box-shadow: none;
  background-color: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  font-size: 14px;
  padding: 8px 20px;
  min-width: 120px;
`;
