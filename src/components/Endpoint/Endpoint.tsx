import * as React from 'react';
import { ShelfIcon } from '../../common-elements';
import { OperationModel } from '../../services';
import { Markdown } from '../Markdown/Markdown';
import { OptionsContext } from '../OptionsProvider';
import { SelectOnClick } from '../SelectOnClick/SelectOnClick';
import { TryItConsole } from '../TryItConsole/TryItConsole';

import { expandDefaultServerVariables, getBasePath } from '../../utils';
import {
  EndpointInfo,
  HttpVerb,
  OperationEndpointWrap,
  ServerItem,
  ServerRelativeURL,
  Servers,
  ServerUrl,
  TryItButton,
} from './styled.elements';

export interface EndpointProps {
  operation: OperationModel;

  hideHostname?: boolean;
  inverted?: boolean;
  compact?: boolean;
}

export interface EndpointState {
  expanded: boolean;
  tryItExpanded: boolean;
}

export class Endpoint extends React.Component<EndpointProps, EndpointState> {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      tryItExpanded: false,
    };
  }

  toggle = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  toggleTryIt = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    this.setState({ tryItExpanded: !this.state.tryItExpanded, expanded: false });
  };

  render() {
    const { operation, inverted, hideHostname } = this.props;
    const { expanded, tryItExpanded } = this.state;

    // TODO: highlight server variables, e.g. https://{user}.test.com
    return (
      <OptionsContext.Consumer>
        {options => (
          <>
            {tryItExpanded ? (
              <TryItConsole onClose={this.toggleTryIt} operation={operation} />
            ) : (
              <div>
                <OperationEndpointWrap
                  onClick={this.toggle}
                  $expanded={expanded}
                  $inverted={inverted}
                  $tryItExpanded={tryItExpanded}
                >
                  <EndpointInfo>
                    <HttpVerb type={operation.httpVerb} $compact={this.props.compact}>
                      {operation.httpVerb}
                    </HttpVerb>
                    <ServerRelativeURL>{operation.path}</ServerRelativeURL>
                    <ShelfIcon
                      float={'right'}
                      color={inverted ? 'black' : 'rgba(245, 247, 250)'}
                      size={'20px'}
                      direction={expanded ? 'down' : 'right'}
                    />
                  </EndpointInfo>
                  <TryItButton onClick={this.toggleTryIt}>Try it</TryItButton>
                </OperationEndpointWrap>
                {expanded && (
                  <Servers aria-hidden={!expanded}>
                    {operation.servers.map(server => {
                      const normalizedUrl = options.expandDefaultServerVariables
                        ? expandDefaultServerVariables(server.url, server.variables)
                        : server.url;
                      const basePath = getBasePath(normalizedUrl);
                      return (
                        <ServerItem key={normalizedUrl}>
                          <Markdown source={server.description || ''} compact={true} />
                          <SelectOnClick>
                            <ServerUrl>
                              <span>
                                {hideHostname || options.hideHostname
                                  ? basePath === '/'
                                    ? ''
                                    : basePath
                                  : normalizedUrl}
                              </span>
                              {operation.path}
                            </ServerUrl>
                          </SelectOnClick>
                        </ServerItem>
                      );
                    })}
                  </Servers>
                )}
              </div>
            )}
          </>
        )}
      </OptionsContext.Consumer>
    );
  }
}
