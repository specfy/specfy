import { Time } from '../Time';

import cls from './index.module.scss';

export const UpdatedAt: React.FC<{ time: string }> = ({ time }) => {
  return (
    <div className={cls.updatedAt}>
      Updated <Time time={time} />
    </div>
  );
};
