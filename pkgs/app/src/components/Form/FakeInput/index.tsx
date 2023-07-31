import classnames from 'classnames';

import type { InputProps } from '../Input';
import { Input } from '../Input';

import cls from './index.module.scss';

const H1: React.FC<InputProps> = (args) => {
  return (
    <div className={cls.fake}>
      <Input {...args} className={classnames(cls.input, cls.h1)} />
    </div>
  );
};

const H2: React.FC<InputProps> = (args) => {
  return (
    <div className={cls.fake}>
      <Input {...args} className={classnames(cls.input, cls.h2)} />
    </div>
  );
};

export type FakeInputProps = {
  H1: typeof H1;
  H2: typeof H2;
};

export const FakeInput: FakeInputProps = {
  H1: H1,
  H2: H2,
};
