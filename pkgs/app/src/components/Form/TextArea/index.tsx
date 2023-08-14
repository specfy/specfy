import classNames from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> & {
  size?: 'l' | 'm' | 's' | 'xl';
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = 'm', ...props }, ref) => {
    return (
      <textarea
        className={classNames(cls.textarea, cls[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
