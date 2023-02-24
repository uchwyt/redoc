import styled, { css } from '../../styled-components';

export const Label = styled.label<{ required?: boolean }>`
  padding-bottom: 6px;
  display: block;
  white-space: nowrap;
  line-height: 1em;

  ${({ required }) =>
    required &&
    css`
      &:after {
        display: inline-block;
        content: '*';
        margin-left: 4px;
        color: ${props => props.theme.colors.error.main};
      }
    `}
`;

export const Root = styled.div`
  width: 100%;
  font-family: ${props => props.theme.typography.fontFamily};
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

export const InputContainer = styled.div`
  display: inline-block;
  width: 100%;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const StyledInput = styled.input<{ password }>`
  border: medium none;
  outline: none;
  padding: ${({ password }) => (password ? '8px 40px 8px 8px' : '8px')};
  border-radius: 4px;
  background-color: rgb(50, 63, 75);
  color: rgb(245, 247, 250);
  font-size: 14px;
  width: 100%;
`;

export const Error = styled.div`
  color: ${props => props.theme.colors.error.main};
  font-size: 0.9em;
`;

export const ShowButton = styled.span`
  position: absolute;
  right: 0;
  line-height: normal;
  font-size: 0.8em;
  padding: 10px;
  cursor: pointer;
  text-align: center;
  color: rgb(238, 238, 238);
`;
