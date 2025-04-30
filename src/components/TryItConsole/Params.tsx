import React from 'react';
import { FieldModel } from '../../services';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { DropdownOption, Input } from '../../common-elements';
import validator from 'validator';
import { useMemo } from 'react';
import { DropdownOrLabel } from '../DropdownOrLabel/DropdownOrLabel';
import {
  ArrayFieldContainer,
  ArrayItem,
  DeleteButton,
  InvertedSimpleDropdown,
  Label,
  MimeLabel,
} from '../PayloadSamples/styled.elements';

export interface ParamsProps {
  fields: FieldModel[];
  path: string;
}

export interface FieldModelInt {
  type: string;
  isEnum: boolean;
  name: string;
  options: DropdownOption[];
  label: string;
  required?: boolean;
  placeholder?: string;
}

const required = value =>
  (!value && value !== 0) || validator.isEmpty(`${value}`.trim()) ? 'Field is required' : undefined;

const Params = ({ fields, path }: ParamsProps): JSX.Element => {
  //  const {input: {value: paramsValue}} = useField(path);

  const params = useMemo(() => {
    const tmp: FieldModelInt[] = [];

    fields.forEach(field => {
      const isEnum = field.schema.enum?.length > 0;
      //   const isArray = field.schema.type === 'array';

      const options = [
        field.required ? false : { value: '', label: '' },
        ...field.schema.enum?.map(item => ({ value: item, label: item })),
      ].filter(Boolean) as DropdownOption[];

      tmp.push({
        type: field.schema.type as string,
        isEnum,
        name: `${path}.${field.name}`,
        options,
        label: field.name,
        required: field.required,
        placeholder: Array.isArray(field.schema.type)
          ? field.schema.type.join(',')
          : field.schema.type,
      });

      /*if(isArray) {
        const value = paramsValue[field.name] || [];
        const valueType = field?.schema?.schema?.items && typeof field.schema.schema.items === 'object' && !Array.isArray(field.schema.schema.items) ? field.schema.schema.items.type : 'string';

        tmp.push(...value.map((_, index) => ({
          type: valueType as string,
          isEnum: false,
          name: `${path}.${field.name}[${index}]`,
          label: `[${index}]`,
          required: true,
          placeholder: valueType
        })))
      }*/
    });

    return tmp;
  }, [fields, path]);

  return (
    <>
      {params.map((parameter, index) => (
        <div key={index}>
          {parameter.type === 'array' ? (
            <FieldArray name={parameter.name}>
              {({ fields }) => {
                return (
                  <>
                    <ArrayFieldContainer>
                      <Label>
                        {parameter.label} ({fields.length} items)
                      </Label>
                      <span onClick={() => fields.push('')}>Add item +</span>
                    </ArrayFieldContainer>
                    {fields.map((fieldName, index) => (
                      <ArrayItem key={fieldName}>
                        <DeleteButton onClick={() => fields.remove(index)}>delete</DeleteButton>
                        <Field
                          name={fieldName}
                          validate={parameter.required ? required : undefined}
                        >
                          {({ input, meta }) => {
                            return (
                              <Input
                                input={input}
                                meta={meta}
                                label={`[${index}]`}
                                required={parameter.required}
                                placeholder="string"
                              />
                            );
                          }}
                        </Field>
                      </ArrayItem>
                    ))}
                  </>
                );
              }}
            </FieldArray>
          ) : (
            <Field name={parameter.name} validate={parameter.required ? required : undefined}>
              {({ input, meta }) => {
                if (parameter.isEnum) {
                  return (
                    <DropdownOrLabel
                      variant="dark"
                      options={parameter.options}
                      onChange={value => input.onChange(value.value)}
                      value={input.value}
                      Label={MimeLabel}
                      Dropdown={InvertedSimpleDropdown}
                    />
                  );
                }

                return (
                  <Input
                    input={input}
                    meta={meta}
                    label={parameter.label}
                    required={parameter.required}
                    placeholder={parameter.placeholder}
                  />
                );
              }}
            </Field>
          )}
        </div>
      ))}
    </>
  );
};

export default React.memo<ParamsProps>(Params);
