import type { ApiProject } from '@specfy/api/src/types/api';
import {
  IconBox,
  IconCode,
  IconLock,
  IconMaximize,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';
import { Button, Tooltip } from 'antd';
import classnames from 'classnames';
import type React from 'react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReactFlow, useViewport } from 'reactflow';

import { useEdit } from '../../../hooks/useEdit';
import { Flex } from '../../Flex';
import { PreviewNode } from '../CustomNode';

import cls from './index.module.scss';

const ToolbarContainer: React.FC<{
  position: 'bottom' | 'left' | 'top';
  visible?: boolean;
  children: React.ReactNode;
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

const ToolbarReadonly: React.FC = () => {
  const edit = useEdit();
  const [label, setLabel] = useState('Read-Only');
  const onClick = () => {
    edit.enable(true);
  };
  const onMouseEnter = () => {
    setLabel('Enable Edit');
  };
  const onMouseLeave = () => {
    setLabel('Read-Only');
  };

  return (
    <div
      className={classnames(cls.toolbar, cls.dark)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <button title="Click to enable edition">
        <Flex gap="m">
          {label}
          <IconLock />
        </Flex>
      </button>
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

const ToolbarAddComponents: React.FC = () => {
  const previewService = useRef<HTMLDivElement>(null);
  const previewHosting = useRef<HTMLDivElement>(null);

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: 'hosting' | 'service'
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setDragImage(
      nodeType === 'hosting'
        ? previewHosting.current!
        : previewService.current!,
      0,
      0
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={cls.toolbar}>
      <div
        style={{
          transform: 'translate(-10000px, -10000px)',
          position: 'absolute',
          pointerEvents: 'none',
        }}
      >
        <div ref={previewService}>
          <PreviewNode
            info={false}
            node={{
              id: '',
              data: {
                name: 'service',
                type: 'service',
                techId: null,
                typeId: null,
                originalSize: {} as any,
              },
            }}
          />
        </div>
        <div ref={previewHosting}>
          <PreviewNode
            info={false}
            node={{
              id: '',
              data: {
                name: 'hosting',
                type: 'hosting',
                techId: null,
                typeId: null,
                originalSize: {} as any,
              },
            }}
          />
        </div>
      </div>
      <div
        className={cls.add}
        onDragStart={(event) => onDragStart(event, 'service')}
        draggable
      >
        <IconCode /> Service
      </div>
      <div
        className={cls.add}
        onDragStart={(event) => onDragStart(event, 'hosting')}
        draggable
      >
        <IconBox /> Host
      </div>
    </div>
  );
};

export type ToolbarProps = typeof ToolbarContainer & {
  Zoom: typeof ToolbarZoom;
  Fullscreen: typeof ToolbarFullscreen;
  Main: typeof ToolbarMain;
  Readonly: typeof ToolbarReadonly;
  AddComponents: typeof ToolbarAddComponents;
};

export const Toolbar = ToolbarContainer as ToolbarProps;
Toolbar.Zoom = ToolbarZoom;
Toolbar.Fullscreen = ToolbarFullscreen;
Toolbar.Main = ToolbarMain;
Toolbar.Readonly = ToolbarReadonly;
Toolbar.AddComponents = ToolbarAddComponents;
