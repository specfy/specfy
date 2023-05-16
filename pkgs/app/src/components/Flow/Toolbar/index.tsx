import { IconZoomIn, IconZoomOut } from '@tabler/icons-react';
import { Button, Tooltip } from 'antd';
import classnames from 'classnames';
import { useReactFlow, useViewport } from 'reactflow';

import cls from './index.module.scss';

const ToolbarContainer: React.FC<{
  position: 'bottom' | 'top';
  visible?: boolean;
  children: React.ReactElement | React.ReactElement[];
}> = ({ children, position, visible }) => {
  return (
    <div
      className={classnames(cls.menu, cls[position], visible && cls.visible)}
      data-toolbar
    >
      {children}
    </div>
  );
};

const ToolbarMain: React.FC = () => {
  return <div className={cls.toolbar}></div>;
};

const ToolbarZoom: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  function handleZoomIn() {
    zoomIn();
  }
  function handleZoomOut() {
    zoomOut();
  }
  function handmeZoomReset() {
    fitView({});
  }

  return (
    <div className={cls.toolbar}>
      <Tooltip title="Zoom Out (Cmd -)" placement="bottom">
        <Button icon={<IconZoomOut />} type="text" onClick={handleZoomOut} />
      </Tooltip>
      <Tooltip title="Reset to fit" placement="bottom">
        <Button type="text" onClick={handmeZoomReset}>
          {Math.ceil(zoom * 100)}%
        </Button>
      </Tooltip>
      <Tooltip title="Zoom In (Cmd +)" placement="bottom">
        <Button icon={<IconZoomIn />} type="text" onClick={handleZoomIn} />
      </Tooltip>
    </div>
  );
};

export type ToolbarProps = typeof ToolbarContainer & {
  Zoom: typeof ToolbarZoom;
  Main: typeof ToolbarMain;
};

export const Toolbar = ToolbarContainer as ToolbarProps;
Toolbar.Zoom = ToolbarZoom;
Toolbar.Main = ToolbarMain;
