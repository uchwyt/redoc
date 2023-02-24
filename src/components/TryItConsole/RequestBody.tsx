import * as React from 'react';
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionHeaderText,
  SectionTitle,
  Title,
  IntRequestBody,
} from './styled.elements';
import { Field, useFormState } from 'react-final-form';
import { DropdownOption, ErrorIcon, PadlockIcon, ShelfIcon } from '../../common-elements';
import Auths from './Auths';
import ReactCodeMirror from '@uiw/react-codemirror';
import { material } from '@uiw/codemirror-theme-material';
import { json } from '@codemirror/lang-json';
import Params from './Params';
import { useCallback, useMemo, useState } from 'react';
import { FieldModel } from '../../services';
import { DropdownOrLabel } from '../DropdownOrLabel/DropdownOrLabel';
import { InvertedSimpleDropdown, MimeLabel } from '../PayloadSamples/styled.elements';
import { SecurityRequirementModel } from '../../services/models/SecurityRequirement';
import { getIn } from 'final-form';

function DropdownWithinHeader(props) {
  return <DropdownOrLabel {...props} Label={MimeLabel} Dropdown={InvertedSimpleDropdown} />;
}

export interface RequestBodyProps {
  initialExpanded: number;
  serverOptions: DropdownOption[];
  mimeOptions?: DropdownOption[];
  sections: Record<string, FieldModel[]>;
  requestBody: boolean;
  security: SecurityRequirementModel[];
}

const config = { subscription: { errors: true, touched: true } };

const RequestBody = ({
  initialExpanded,
  serverOptions,
  mimeOptions,
  sections,
  security,
  requestBody,
}: RequestBodyProps): JSX.Element => {
  const [expanded, setExpanded] = useState(initialExpanded);

  const expandAuth = useCallback(() => setExpanded(old => (old === 1 ? 0 : 1)), []);
  const expandParams = useCallback(() => setExpanded(old => (old === 2 ? 0 : 2)), []);
  const expandBody = useCallback(() => setExpanded(old => (old === 3 ? 0 : 3)), []);

  const formState = useFormState(config);

  const valid = useMemo(() => {
    const { touched = {}, errors = {} } = formState;

    const touchedKeys = Object.keys(touched);

    const authKeys = touchedKeys.filter(key => key.startsWith('auth.'));
    const parameterKeys = touchedKeys.filter(key =>
      ['query', 'path', 'header', 'cookie'].some(option => key.startsWith(`${option}.`)),
    );

    return {
      auth:
        authKeys.length === 0 ||
        !authKeys.some(key => touched[key] === true && !!getIn(errors, key)),
      parameters:
        parameterKeys.length === 0 ||
        !parameterKeys.some(key => touched[key] === true && !!getIn(errors, key)),
      body: true,
    };
  }, [formState]);

  return (
    <IntRequestBody>
      <Title>Target server:</Title>
      <Field name="server">
        {({ input }) => (
          <DropdownWithinHeader
            variant="dark"
            options={serverOptions}
            onChange={value => input.onChange(value.value)}
            value={input.value}
          />
        )}
      </Field>

      {security.length > 0 && (
        <Section>
          <SectionHeader onClick={expandAuth} expanded={expanded === 1}>
            <SectionHeaderText>
              <span>Security</span>
              <ShelfIcon size="14px" color="white" direction={expanded === 1 ? 'down' : 'right'} />
            </SectionHeaderText>
            {valid.auth ? <PadlockIcon size="14px" color="success" /> : <ErrorIcon size="14px" />}
          </SectionHeader>
          <SectionContent expanded={expanded === 1}>
            {security.map((security, index) => (
              <Auths definitions={security.schemes} key={index} />
            ))}
            <small>
              <strong>Note</strong>: Your credentials will be saved until the end of the browser
              session
            </small>
          </SectionContent>
        </Section>
      )}
      {requestBody && (
        <Section>
          <SectionHeader onClick={expandBody} expanded={expanded === 3}>
            <SectionHeaderText>
              <span>Body</span>
              <ShelfIcon size="14px" color="white" direction={expanded === 3 ? 'down' : 'right'} />
            </SectionHeaderText>
          </SectionHeader>
          <SectionContent expanded={expanded === 3}>
            <Field name="request.mimeType">
              {({ input }) => (
                <DropdownWithinHeader
                  variant="dark"
                  options={mimeOptions}
                  onChange={value => input.onChange(value.value)}
                  value={input.value}
                />
              )}
            </Field>
            <Field name="request.body">
              {({ input }) => (
                <ReactCodeMirror
                  value={input.value}
                  height="500px"
                  theme={material}
                  extensions={[json()]}
                  onChange={value => {
                    input.onChange(value);
                  }}
                />
              )}
            </Field>
          </SectionContent>
        </Section>
      )}
      {Object.keys(sections).length > 0 && (
        <Section>
          <SectionHeader onClick={expandParams} expanded={expanded === 2}>
            <SectionHeaderText>
              <span>Parameters</span>
              <ShelfIcon size="14px" color="white" direction={expanded === 2 ? 'down' : 'right'} />
            </SectionHeaderText>
            {valid.parameters ? null : <ErrorIcon size="14px" />}
          </SectionHeader>
          <SectionContent expanded={expanded === 2}>
            {Object.keys(sections).map((key, index) => (
              <React.Fragment key={index}>
                <SectionTitle># {key} parameters</SectionTitle>
                <Params fields={sections[key]} path={key} />
              </React.Fragment>
            ))}
          </SectionContent>
        </Section>
      )}
    </IntRequestBody>
  );
};

export default React.memo<RequestBodyProps>(RequestBody);
