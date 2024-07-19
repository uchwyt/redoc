import { Tabs as ReactTabs } from 'react-tabs';

import styled from '../styled-components';

export { Tab, TabList, TabPanel } from 'react-tabs';

export const Tabs = styled(ReactTabs)<{ noBackground?: boolean }>`
  > ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0 0 10px;
    border-bottom: 4px solid rgb(97, 110, 124);

    > li {
      flex: 1;
      cursor: pointer;
      padding: 5px 10px;
      font-size: 14px;
      line-height: 26px;
      font-weight: 400;
      text-align: center;
      color: rgb(245, 247, 250);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:first-child {
        border-top-left-radius: 4px;
      }

      &:last-child {
        border-top-right-radius: 4px;
      }

      &.react-tabs__tab--selected {
        background: rgb(50, 63, 75);
        border-bottom: 4px solid ${props => props.theme.colors.primary.light};
        margin-bottom: -4px;

        &:focus {
          outline: none;
        }
      }

      &:only-child {
        flex: none;
        min-width: 100px;
      }
    }
  }
`;
