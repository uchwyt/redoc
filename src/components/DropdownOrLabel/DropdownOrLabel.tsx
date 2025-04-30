import { DropdownProps, MimeLabel, SimpleDropdown } from '../../common-elements/Dropdown';

export interface DropdownOrLabelProps extends DropdownProps {
  Label?: any;
  Dropdown?: any;
}

export function DropdownOrLabel(props: DropdownOrLabelProps): JSX.Element {
  const { Label = MimeLabel, Dropdown = SimpleDropdown } = props;
  if (props.options.length === 1) {
    return <Label>{props.options[0].value}</Label>;
  }
  return <Dropdown {...props} />;
}
