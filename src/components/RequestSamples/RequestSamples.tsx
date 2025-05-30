import { observer } from 'mobx-react';
import React from 'react';
import { isPayloadSample, OperationModel, RedocNormalizedOptions } from '../../services';
import { PayloadSamples } from '../PayloadSamples/PayloadSamples';
import { SourceCodeWithCopy } from '../SourceCode/SourceCode';

import { Tab, TabList, TabPanel, Tabs } from '../../common-elements';
import { OptionsContext } from '../OptionsProvider';
import { l } from '../../services/Labels';
import Expandable from '../../common-elements/Expandable';

export interface RequestSamplesProps {
  operation: OperationModel;
}

@observer
export class RequestSamples extends React.Component<RequestSamplesProps> {
  static contextType = OptionsContext;
  context: RedocNormalizedOptions;
  operation: OperationModel;

  render() {
    const { operation } = this.props;
    const samples = operation.codeSamples;

    const hasSamples = samples.length > 0;
    const hideTabList = samples.length === 1 ? this.context.hideSingleRequestSampleTab : false;
    return (
      (hasSamples && (
        <Expandable defaultExpanded={true} title={l('requestSamples')}>
          <div>
            <Tabs defaultIndex={0}>
              <TabList hidden={hideTabList}>
                {samples.map(sample => (
                  <Tab key={sample.lang + '_' + (sample.label || '')}>
                    {sample.label !== undefined ? sample.label : sample.lang}
                  </Tab>
                ))}
              </TabList>
              {samples.map(sample => (
                <TabPanel key={sample.lang + '_' + (sample.label || '')}>
                  {isPayloadSample(sample) ? (
                    <div>
                      <PayloadSamples content={sample.requestBodyContent} />
                    </div>
                  ) : (
                    <SourceCodeWithCopy lang={sample.lang} source={sample.source} />
                  )}
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
