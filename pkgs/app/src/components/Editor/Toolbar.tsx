import { HistoryOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import classnames from 'classnames';

import cls from './toolbar.module.scss';

export const ToolbarMini: React.FC<{
  isUpdated: boolean;
  onRevert: () => void;
}> = ({ isUpdated, onRevert }) => {
  return (
    <div className={cls.toolbarMini}>
      <div className={cls.hover}>
        <Tooltip title="Revert all changes">
          <Button
            icon={<HistoryOutlined />}
            size="small"
            className={classnames(isUpdated && cls.isUpdated)}
            onClick={onRevert}
          />
        </Tooltip>
      </div>
    </div>
  );
};
