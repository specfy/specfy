import {
  IconCircleCheckFilled,
  IconExclamationCircle,
  IconInfoCircle,
} from '@tabler/icons-react';
import classnames from 'classnames';

export const Banner: React.FC<{
  children: React.ReactNode;
  type: 'error' | 'info' | 'success' | 'warning';
}> = ({ children, type }) => {
  return (
    <div
      className={classnames(
        'flex py-4 px-8 items-center border rounded-md text-sm mb-4'
        // type === 'info' && 'bg-[#edf6ff] border-[#cee7fe]',
        // type === 'warning' && 'bg-[#fff4d5] border-[#ffe3a2]'
      )}
    >
      <div className="">
        {type === 'success' && <IconCircleCheckFilled />}
        {type === 'warning' && <IconExclamationCircle />}
        {type === 'error' && <IconExclamationCircle />}
        {type === 'info' && <IconInfoCircle />}
      </div>
      <div className="px-8">{children}</div>
    </div>
  );
};
