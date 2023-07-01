import type { ApiProject } from '@specfy/api/src/types/api';
import {
  IconLock,
  IconMaximize,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';
import { Button, Tooltip } from 'antd';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { useReactFlow, useViewport } from 'reactflow';

import { Flex } from '../../Flex';

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

const ToolbarReadonly: React.FC<{ visible: boolean }> = ({ visible }) => {
  // <Toolbar> doesn't want boolean
  if (!visible) {
    return null;
  }

  return (
    <div className={classnames(cls.toolbar, cls.dark)}>
      <Flex gap="m">
        Read-Only
        <IconLock />
      </Flex>
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
const ToolbarFullscreen: React.FC<{ project: ApiProject }> = ({ project }) => {
  return (
    <div className={cls.toolbar}>
      <Tooltip title="Fullscreen" placement="bottom">
        <Link to={`/${project.orgId}/${project.slug}/flow`}>
          <Button icon={<IconMaximize />} type="text" />
        </Link>
      </Tooltip>
    </div>
  );
};

export type ToolbarProps = typeof ToolbarContainer & {
  Zoom: typeof ToolbarZoom;
  Fullscreen: typeof ToolbarFullscreen;
  Main: typeof ToolbarMain;
  Readonly: typeof ToolbarReadonly;
};

export const Toolbar = ToolbarContainer as ToolbarProps;
Toolbar.Zoom = ToolbarZoom;
Toolbar.Fullscreen = ToolbarFullscreen;
Toolbar.Main = ToolbarMain;
Toolbar.Readonly = ToolbarReadonly;
