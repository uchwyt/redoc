import * as React from 'react';
import styled from '../styled-components';

const directionMap = {
  left: '90deg',
  right: '-90deg',
  up: '-180deg',
  down: '0',
};

const IntShelfIcon = (props: {
  className?: string;
  float?: 'left' | 'right';
  size?: string;
  color?: string;
  direction: 'left' | 'right' | 'up' | 'down';
  style?: React.CSSProperties;
}): JSX.Element => {
  return (
    <svg
      className={props.className}
      style={props.style}
      version="1.1"
      viewBox="0 0 24 24"
      x="0"
      xmlns="http://www.w3.org/2000/svg"
      y="0"
      aria-hidden="true"
    >
      <polygon points="17.3 8.3 12 13.6 6.7 8.3 5.3 9.7 12 16.4 18.7 9.7 " />
    </svg>
  );
};

export const ShelfIcon = styled(IntShelfIcon)`
  height: ${props => props.size || '18px'};
  width: ${props => props.size || '18px'};
  min-width: ${props => props.size || '18px'};
  vertical-align: middle;
  float: ${props => props.float || ''};
  transition: transform 0.2s ease-out;
  transform: rotateZ(${props => directionMap[props.direction || 'down']});

  polygon {
    fill: ${({ color, theme }) =>
      (color && theme.colors.responses[color] && theme.colors.responses[color].color) || color};
  }
`;

export const Badge = styled.span<{ type: string; color?: string }>`
  display: inline-block;
  padding: 2px 8px;
  margin: 0;
  background-color: ${props => props.color || props.theme.colors[props.type].main};
  color: ${props => props.theme.colors[props.type].contrastText};
  font-size: ${props => props.theme.typography.code.fontSize};
  vertical-align: middle;
  line-height: 1.6;
  border-radius: 4px;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  font-size: 12px;
  + span[type] {
    margin-left: 4px;
  }
`;

export const IntPadlockIcon = (props: {
  className?: string;
  float?: 'left' | 'right';
  size?: string;
  color?: string;
  style?: React.CSSProperties;
}): JSX.Element => (
  <svg version="1.1" viewBox="0 0 100 100" {...props}>
    <path d="M16.1 45.4V92.5h67.8V45.4H16.1zM53.9 70.9v12.4h-7.4V70.9c-3.2-1.4-5.4-4.6-5.4-8.2 0-5 4-9 9-9 5 0 9 4.1 9 9C59.3 66.3 57.1 69.5 53.9 70.9zM37.2 39.8c-0.3 0-1.4-2.9-1.4-2.9 -0.5-1.5-0.7-3-0.7-4.6 0-8.4 6.8-15.2 15.2-15.2 8.4 0 15.2 6.8 15.2 15.2 0 1.6-0.2 3.1-0.7 4.6l0 0 0 0c0 0-1.1 2.9-1.4 2.9 -0.3 0 10.4 0 10.6 0l0 0c0.8-2.4 1.2-4.9 1.2-7.5C75.1 18.6 64 7.5 50.3 7.5c-13.7 0-24.8 11.1-24.8 24.8 0 2.5 0.4 5.1 1.2 7.5C26.6 39.8 37.5 39.8 37.2 39.8z"></path>
  </svg>
);

export const IntErrorIcon = (props: {
  className?: string;
  float?: 'left' | 'right';
  size?: string;
  style?: React.CSSProperties;
}): JSX.Element => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.879 122.879" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M61.44,0c33.933,0,61.439,27.507,61.439,61.439 s-27.506,61.439-61.439,61.439C27.507,122.879,0,95.372,0,61.439S27.507,0,61.44,0L61.44,0z M73.451,39.151 c2.75-2.793,7.221-2.805,9.986-0.027c2.764,2.776,2.775,7.292,0.027,10.083L71.4,61.445l12.076,12.249 c2.729,2.77,2.689,7.257-0.08,10.022c-2.773,2.765-7.23,2.758-9.955-0.013L61.446,71.54L49.428,83.728 c-2.75,2.793-7.22,2.805-9.986,0.027c-2.763-2.776-2.776-7.293-0.027-10.084L51.48,61.434L39.403,49.185 c-2.728-2.769-2.689-7.256,0.082-10.022c2.772-2.765,7.229-2.758,9.953,0.013l11.997,12.165L73.451,39.151L73.451,39.151z"
    ></path>
  </svg>
);

export const PadlockIcon = styled(IntPadlockIcon)`
  height: ${props => props.size || '18px'};
  width: ${props => props.size || '18px'};
  min-width: ${props => props.size || '18px'};
  vertical-align: middle;
  float: ${props => props.float || ''};

  path {
    fill: ${({ color, theme }) =>
      (color && theme.colors.responses[color] && theme.colors.responses[color].color) || color};
  }
`;

export const ErrorIcon = styled(IntErrorIcon)`
  height: ${props => props.size || '18px'};
  width: ${props => props.size || '18px'};
  min-width: ${props => props.size || '18px'};
  vertical-align: middle;
  float: ${props => props.float || ''};

  path {
    fill: ${({ theme }) => theme.colors.error.light};
  }
`;
