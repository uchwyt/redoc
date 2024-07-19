import { observer } from 'mobx-react';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import createDecorator from 'final-form-focus';
import createCalculator from 'final-form-calculate';
import axios, { AxiosResponse } from 'axios';
import {
  ExampleModel,
  FieldModel,
  OpenAPIParser,
  OperationModel,
  RedocNormalizedOptions,
} from '../../services';
import {
  Close,
  Header,
  Meta,
  ResponseBody,
  StatusRow,
  HeadersSnippet,
  Title,
  HeaderButton,
} from './styled.elements';
import { Example } from '../PayloadSamples/Example';
import { getStatusCodeType } from '../../utils';
import {
  EndpointInfo,
  HttpVerb,
  OperationEndpointWrap,
  ServerRelativeURL,
  TryItButton,
} from '../Endpoint/styled.elements';
import RequestBody from './RequestBody';

export interface OperationProps {
  operation: OperationModel;
  onClose: (event: React.MouseEvent) => void;
}

export interface Metadata {
  size: number;
  statusText: string;
  status: number;
  time: number;
}

const opts = new RedocNormalizedOptions({});
const subscription = { values: true };

const mutators = {
  ...arrayMutators,
};
// Create Decorator
const decorator = createDecorator();
const calculate = createCalculator({
  field: /auth/,
  updates: (_a, _b, allValues: Record<string, unknown>, prevValues) => {
    if (!allValues || !prevValues) {
      return {};
    }
    sessionStorage.setItem('saved-auth', JSON.stringify({ auth: allValues.auth }));

    return {};
  },
});

// Decorate form
const undecorate = [decorator, calculate];

const getInitialState = () => {
  const savedState = sessionStorage.getItem('saved-auth');
  let json = {};
  if (savedState) {
    try {
      json = JSON.parse(savedState);
    } catch (e) {
      //
    }
  }
  return json;
};

const createSearch = (data: Record<string, any>) => {
  const ret: string[] = [];
  Object.keys(data).forEach(key => {
    const one = data[key];
    if (key !== '' && one && one !== '') {
      ret.push(`${key}=${encodeURIComponent(one)}`);
    }
  });
  return ret.length > 0 ? `?${ret.join('&')}` : '';
};

export const TryItConsole = observer(({ operation, onClose }: OperationProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState<ExampleModel | null>(null);
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const [meta, setMetadata] = useState<Metadata | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchData = useCallback(
    async formData => {
      setSubmitting(true);
      const parser = new OpenAPIParser({ openapi: '3.0.1' } as any, undefined, opts);
      const { server, request, query, header, path, cookie, auth } = formData;

      const startTime = Date.now();

      const headers = {
        'Content-Type': request?.mimeType || 'application/json',
        Accept: 'application/json',
      };

      if (auth) {
        operation.security.forEach(security => {
          security.schemes.forEach(schema => {
            if (schema.type === 'apiKey' && auth[schema.id] && schema.name) {
              if (schema.in === 'header') {
                headers[schema.name] = auth[schema.id];
              }
              if (schema.in === 'cookie') {
                cookie[schema.name] = auth[schema.id];
              }
              if (schema.in === 'query') {
                query[schema.name] = auth[schema.id];
              }
            } else if (schema.type === 'http') {
              headers['Authorization'] = `Basic ${btoa(
                `${auth.basic?.username}:${auth.basic?.password}`,
              )}`;
            }
          });
        });
      }

      if (header) {
        Object.keys(header).forEach(key => {
          headers[key] = header[key];
        });
      }

      let preparedPath = operation.path;

      if (path) {
        Object.keys(path).forEach(key => {
          preparedPath = preparedPath.replace(key, path[key]);
        });
      }

      const handleResponse = (response: AxiosResponse) => {
        const time = (Date.now() - startTime) / 1000;
        const responseHeader = new Headers(response.headers as Record<string, string>);

        const example = new ExampleModel(
          parser,
          { value: response.data },
          responseHeader.get('Content-Type') || 'application/json',
          undefined,
        );
        setContent(example);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const keys = responseHeader.keys();

        const tmpHeaders = {};
        let entry: { done: boolean; value: string };
        let done = false;
        entry = keys.next();
        do {
          const key = entry.value;
          if (key) {
            tmpHeaders[key] = responseHeader.get(key);
          }

          if (!entry.done) {
            entry = keys.next();
          } else {
            done = true;
          }
        } while (!done);

        setHeaders(tmpHeaders);
        setMetadata({
          status: response.status,
          statusText: response.statusText,
          size: Number(responseHeader.get('Content-Length')),
          time,
        });
        setActiveTab(1);
      };

      try {
        const instance = axios.create({
          baseURL: server,
          headers,
        });
        instance.interceptors.response.use(
          response => {
            handleResponse(response);
            return response;
          },
          error => {
            handleResponse(error.response);
            return Promise.reject(error);
          },
        );

        await instance[operation.httpVerb](preparedPath, {
          params: query,
          body: request?.body,
        });
      } catch (e) {
        // console.error(e);
      } finally {
        setSubmitted(true);
        setSubmitting(false);
      }
    },
    [operation],
  );

  const serverOptions = useMemo(
    () =>
      operation.servers.map(serv => ({
        value: serv.url,
        title: `${serv.description} - ${serv.url}`,
      })),
    [operation.servers],
  );

  const initialValues = useMemo(() => {
    const { requestBody } = operation;

    if (requestBody && requestBody.content) {
      const {
        content: { active, mediaTypes },
      } = requestBody;

      const examples = active.examples;
      let body = '';
      const mimeType = mediaTypes[0].name;

      if (examples) {
        const example = Object.values(examples).find(ex => ex.mime === mimeType)?.value;
        body = JSON.stringify(example, undefined, 2);
      }
      if (!body) {
        body = JSON.stringify(
          active?.generateExample(operation.parser, mediaTypes[0]),
          undefined,
          2,
        );
      }

      return {
        ...getInitialState(),
        server: operation.servers[0]?.url,
        request: {
          mimeType,
          body,
        },
      };
    }

    return {
      ...getInitialState(),
      server: operation.servers[0]?.url,
    };
  }, [operation]);

  const initialExpanded = useMemo(() => {
    if (operation.security.length) {
      return 1;
    }
    if (operation.requestBody) {
      return 3;
    }
    return operation.parameters.length > 0 ? 2 : 0;
  }, [operation]);

  const sections = useMemo(() => {
    const groups: Record<string, FieldModel[]> = {};

    operation.parameters.forEach(param => {
      const key = param.in as string;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(param);
    });
    return groups;
  }, [operation]);

  const mimeOptions = useMemo(
    () =>
      operation.requestBody?.content?.mediaTypes.map(mediaType => ({
        value: mediaType.name,
        label: mediaType.name,
      })),
    [operation],
  );

  const showRequest = useCallback(() => setActiveTab(0), []);
  const showResponse = useCallback(() => setActiveTab(1), []);

  return (
    <Form
      onSubmit={fetchData}
      subscription={subscription}
      initialValues={initialValues}
      mutators={mutators}
      decorators={undecorate}
    >
      {({ handleSubmit, values }) => {
        const preparedPath = `${operation.path}${values.query ? createSearch(values.query) : ''}`;

        return (
          <div>
            <Header>
              <div>
                <HeaderButton active={activeTab === 0} key="request" onClick={showRequest}>
                  {submitted ? 'Edit Request' : 'Request'}
                </HeaderButton>
                <HeaderButton
                  active={activeTab === 1}
                  key="response"
                  onClick={showResponse}
                  disabled={!submitted}
                >
                  Response
                </HeaderButton>
              </div>
              <Close onClick={onClose}>x</Close>
            </Header>
            {activeTab === 0 ? (
              <RequestBody
                initialExpanded={initialExpanded}
                serverOptions={serverOptions}
                sections={sections}
                mimeOptions={mimeOptions}
                requestBody={!!operation.requestBody}
                security={operation.security}
              />
            ) : (
              <ResponseBody>
                {submitted && (
                  <>
                    {meta && (
                      <StatusRow>
                        <Meta color={getStatusCodeType(meta.status)}>Status: {meta.status}</Meta>
                        <Meta>Time: {meta.time}ms</Meta>
                        <Meta>Size: {meta.size} B</Meta>
                      </StatusRow>
                    )}
                    <div>
                      <Title>Headers:</Title>
                      <HeadersSnippet>
                        {headers &&
                          Object.keys(headers).map(key => (
                            <div key={key}>
                              <strong>{key}:</strong>
                              <code>{headers[key]}</code>
                            </div>
                          ))}
                      </HeadersSnippet>
                      <Title>Body:</Title>

                      <div>
                        {content && <Example example={content} mimeType="application/json" />}
                      </div>
                    </div>
                  </>
                )}
              </ResponseBody>
            )}
            <OperationEndpointWrap $tryItExpanded={true}>
              <EndpointInfo>
                <HttpVerb type={operation.httpVerb} $compact={false}>
                  {operation.httpVerb}
                </HttpVerb>
                <ServerRelativeURL $wrap>{preparedPath}</ServerRelativeURL>
              </EndpointInfo>
              <TryItButton onClick={handleSubmit}>
                {submitting ? 'Sending...' : <>{submitted ? 'Resend' : 'Send'}</>}
              </TryItButton>
            </OperationEndpointWrap>
          </div>
        );
      }}
    </Form>
  );
});
