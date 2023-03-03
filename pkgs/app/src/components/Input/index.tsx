import type { InputProps } from 'antd';
import { Input } from 'antd';

import cls from './index.module.scss';

const H1: React.FC<InputProps> = (args) => {
  return (
    <div className={cls.fake}>
      <Input {...args} className={cls.input} />
    </div>
  );
};

export type FakeInputProps = {
  H1: typeof H1;
};

export const FakeInput: FakeInputProps = {
  H1: H1,
};
