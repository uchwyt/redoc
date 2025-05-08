import React from 'react';
import { FieldInputProps, FieldMetaState } from 'react-final-form';
import {
  Root,
  Error,
  ShowButton,
  InputWrapper,
  InputContainer,
  StyledInput,
  Label,
} from './styled.elements';
import { useCallback, useEffect, useState } from 'react';

export interface InputProps {
  label?: string;
  inputType?: string;
  input: FieldInputProps<string>;
  meta: FieldMetaState<string>;
  placeholder?: string;
  required?: boolean;
}

const InputComponent = (props: InputProps): JSX.Element => {
  const { label, input, meta, inputType, placeholder, required } = props;

  const { error, submitError, touched } = meta;

  const [type, setType] = useState(inputType);

  const togglePasswordVisible = useCallback(() => {
    setType(old => (old === 'password' ? 'text' : 'password'));
  }, []);

  useEffect(() => {
    setType(inputType);
  }, [inputType]);

  return (
    <Root>
      {label && <Label required={required}>{label}:</Label>}
      <InputContainer>
        <InputWrapper>
          <StyledInput
            type={type}
            placeholder={placeholder}
            id={input.name}
            required={required}
            password={inputType === 'password'}
            {...input}
          />
          {inputType === 'password' && (
            <ShowButton onClick={togglePasswordVisible}>
              {type === 'password' ? 'show' : 'hide'}
            </ShowButton>
          )}
        </InputWrapper>
        {(touched && error) || submitError ? <Error>{error || submitError}</Error> : null}
      </InputContainer>
    </Root>
  );
};

export const Input = React.memo<InputProps>(InputComponent);
