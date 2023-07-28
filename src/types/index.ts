import * as React from 'react';
import * as hoistNonReactStatics from 'hoist-non-react-statics';

export * from './open-api';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type WithOptionalTheme<P extends { theme?: T | undefined }, T> = OmitU<P, 'theme'> & {
  theme?: T | undefined;
};
export type IntrinsicElementsKeys = keyof JSX.IntrinsicElements;

export type StyledComponent<
  C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
  T extends object,
  O extends object = {},
  A extends keyof any = never,
> = // the "string" allows this to be used as an object key
  // I really want to avoid this if possible but it's the only way to use nesting with object styles...
  string &
    StyledComponentBase<C, T, O, A> &
    hoistNonReactStatics.NonReactStatics<C extends React.ComponentType<any> ? C : never>;

export interface StyledComponentBase<
  C extends string | React.ComponentType<any>,
  T extends object,
  O extends object = {},
  A extends keyof any = never,
> extends ForwardRefExoticBase<StyledComponentProps<C, T, O, A>> {
  // add our own fake call signature to implement the polymorphic 'as' prop
  (
    props: StyledComponentProps<C, T, O, A> & {
      as?: never | undefined;
      forwardedAs?: never | undefined;
    },
  ): React.ReactElement<StyledComponentProps<C, T, O, A>>;

  <
    AsC extends string | React.ComponentType<any> = C,
    FAsC extends string | React.ComponentType<any> = AsC,
  >(
    props: StyledComponentPropsWithAs<AsC, T, O, A, AsC, FAsC>,
  ): React.ReactElement<StyledComponentPropsWithAs<AsC, T, O, A, AsC, FAsC>>;
}

type ForwardRefExoticBase<P> = PickU<
  React.ForwardRefExoticComponent<P>,
  keyof React.ForwardRefExoticComponent<any>
>;
export type StyledComponentProps<
  // The Component from whose props are derived
  C extends string | React.ComponentType<any>,
  // The Theme from the current context
  T extends object,
  // The other props added by the template
  O extends object,
  // The props that are made optional by .attrs
  A extends keyof any,
  // The Component passed with "forwardedAs" prop
  FAsC extends string | React.ComponentType<any> = C,
> =
  // Distribute O if O is a union type
  O extends object
    ? WithOptionalTheme<MakeAttrsOptional<C, O, A> & MakeAttrsOptional<FAsC, O, A>, T>
    : never;

type StyledComponentPropsWithAs<
  C extends string | React.ComponentType<any>,
  T extends object,
  O extends object,
  A extends keyof any,
  AsC extends string | React.ComponentType<any> = C,
  FAsC extends string | React.ComponentType<any> = C,
> = StyledComponentProps<C, T, O, A, FAsC> & {
  as?: AsC | undefined;
  forwardedAs?: FAsC | undefined;
};

export type PickU<T, K extends keyof T> = T extends any ? { [P in K]: T[P] } : never;
export type OmitU<T, K extends keyof T> = T extends any ? PickU<T, Exclude<keyof T, K>> : never;

type MakeAttrsOptional<
  C extends string | React.ComponentType<any>,
  O extends object,
  A extends keyof P,
  P = React.ComponentPropsWithRef<
    C extends IntrinsicElementsKeys | React.ComponentType<any> ? C : never
  >,
> =
  // Distribute unions early to avoid quadratic expansion
  P extends any ? OmitU<ReactDefaultizedProps<C, P> & O, A> & Partial<PickU<P & O, A>> : never;

// Any prop that has a default prop becomes optional, but its type is unchanged
// Undeclared default props are augmented into the resulting allowable attributes
// If declared props have indexed properties, ignore default props entirely as keyof gets widened
// Wrap in an outer-level conditional type to allow distribution over props that are unions
type Defaultize<P, D> = P extends any
  ? string extends keyof P
    ? P
    : PickU<P, Exclude<keyof P, keyof D>> &
        Partial<PickU<P, Extract<keyof P, keyof D>>> &
        Partial<PickU<D, Exclude<keyof D, keyof P>>>
  : never;
type ReactDefaultizedProps<C, P> = C extends { defaultProps: infer D } ? Defaultize<P, D> : P;
