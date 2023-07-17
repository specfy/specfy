import * as Form from '@radix-ui/react-form';
import classNames from 'classnames';

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
      {error && (
        <Form.Message className={cls.message}>
          <div>{error}</div>
        </Form.Message>
      )}
    </Form.Field>
  );
};
