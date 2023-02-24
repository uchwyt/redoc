import * as React from 'react';
import { useMemo } from 'react';
import { Field } from 'react-final-form';
import { SecurityScheme } from '../../services/models/SecurityRequirement';
import { Input } from '../../common-elements';
import validator from 'validator';

export interface AuthsProps {
  definitions: SecurityScheme[];
}

const required = value =>
  (!value && value !== 0) || validator.isEmpty(`${value}`.trim()) ? 'Field is required' : undefined;

const Auths = ({ definitions }: AuthsProps) => {
  const nonOauthDefinitions = useMemo(
    () => definitions.filter(schema => schema.type !== 'oauth2'),
    [definitions],
  );
  // const oauthDefinitions = useMemo(() => definitions.filter(schema => schema.type === "oauth2"), [definitions]);

  return (
    <div>
      {nonOauthDefinitions.length > 0 &&
        nonOauthDefinitions.map((schema, index) => (
          <React.Fragment key={index}>
            {schema.type === 'apiKey' && (
              <div key={index}>
                <Field name="auth.ApiKeyAuth" validate={required}>
                  {({ input, meta }) => (
                    <Input
                      input={input}
                      meta={meta}
                      inputType="password"
                      required
                      label={schema.name}
                    />
                  )}
                </Field>
              </div>
            )}
            {schema.type === 'http' && (
              <div key={index}>
                <Field name="auth.basic.username" validate={required}>
                  {({ input, meta }) => (
                    <Input input={input} meta={meta} label="Username" required />
                  )}
                </Field>
                <Field name="auth.basic.password" validate={required}>
                  {({ input, meta }) => (
                    <Input
                      input={input}
                      meta={meta}
                      label="Password"
                      inputType="password"
                      required
                    />
                  )}
                </Field>
              </div>
            )}
          </React.Fragment>
        ))}
    </div>
  );
};

export default React.memo<AuthsProps>(Auths);
