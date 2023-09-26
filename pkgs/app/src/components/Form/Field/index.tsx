import * as Form from '@radix-ui/react-form';
import classNames from 'classnames';

import { Flex } from '@/components/Flex';

import cls from './index.module.scss';

export const Field: React.FC<{
  name: string;
  children: React.ReactNode;
  error?: string;
  label?: string;
}> = ({ name, error, label, children }) => {
  return (
    <Form.Field name={name} className={classNames(cls.field)}>
      {label && <Form.Label className={cls.label}>{label}</Form.Label>}
      <Form.Control asChild>{children}</Form.Control>
      <Form.Message className={cls.message}>
        {error && <div>{error}</div>}{' '}
      </Form.Message>
    </Form.Field>
  );
};

export const FieldCheckbox: React.FC<{
  name: string;
  children: React.ReactNode;
  error?: string;
  showError?: boolean;
  label: string;
}> = ({ name, error, label, children, showError = true }) => {
  return (
    <Form.Field name={name} className={classNames(cls.field)}>
      <Flex gap="l">
        <Form.Control id={name} asChild>
          {children}
        </Form.Control>
        <Form.Label htmlFor={name}>{label}</Form.Label>
      </Flex>
      {showError && (
        <Form.Message className={cls.message}>
          {error && <div>{error}</div>}{' '}
        </Form.Message>
      )}
    </Form.Field>
  );
};
