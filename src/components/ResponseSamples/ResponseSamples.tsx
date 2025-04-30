import { observer } from 'mobx-react';
import React from 'react';

import { OperationModel } from '../../services/models';

import { Tab, TabList, TabPanel, Tabs } from '../../common-elements';
import { PayloadSamples } from '../PayloadSamples/PayloadSamples';
import { l } from '../../services/Labels';
import Expandable from '../../common-elements/Expandable';

export interface ResponseSamplesProps {
  operation: OperationModel;
}

@observer
export class ResponseSamples extends React.Component<ResponseSamplesProps> {
  operation: OperationModel;

  render() {
    const { operation } = this.props;
    const responses = operation.responses.filter(response => {
      return response.content && response.content.hasSample;
    });

    return (
      (responses.length > 0 && (
        <Expandable defaultExpanded title={l('responseSamples')}>
          <div>
            <Tabs defaultIndex={0}>
              <TabList>
                {responses.map(response => (
                  <Tab className={'tab-' + response.type} key={response.code}>
                    {response.code}
                  </Tab>
                ))}
              </TabList>
              {responses.map(response => (
                <TabPanel key={response.code}>
                  <div>
                    <PayloadSamples content={response.content!} />
                  </div>
                </TabPanel>
              ))}
            </Tabs>
          </div>
        </Expandable>
      )) ||
      null
    );
  }
}
