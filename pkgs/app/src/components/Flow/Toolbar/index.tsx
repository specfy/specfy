import type { ApiProject } from '@specfy/api/src/types/api';
import {
  IconBox,
  IconCode,
  IconLock,
  IconMaximize,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';
import classnames from 'classnames';
import type React from 'react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReactFlow, useViewport } from 'reactflow';

import { useEdit } from '../../../hooks/useEdit';
import { Flex } from '../../Flex';
import { Button } from '../../Form/Button';
import { TooltipFull } from '../../Tooltip';
import { PreviewNode } from '../CustomNode';

import cls from './index.module.scss';

const Container: React.FC<{
  top?: true;
  left?: true;
  right?: true;
  bottom?: true;
  visible?: boolean;
  children: React.ReactNode;
}> = ({ children, top, left, right, bottom, visible }) => {
  return (
    <div
      className={classnames(
        cls.menu,
        top && cls.top,
        left && cls.left,
        right && cls.right,
        bottom && cls.bottom,
        visible && cls.visible
      )}
      data-toolbar
    >
      {children}
    </div>
  );
};

const Inner: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className={cls.toolbar}>{children}</div>;
};

const Readonly: React.FC = () => {
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
      <TooltipFull msg="Zoom Out (Cmd -)" side="top">
        <Button display="ghost" onClick={handleZoomOut}>
          <IconZoomOut />
        </Button>
      </TooltipFull>
      <TooltipFull msg="Reset to fit" side="top">
        <Button display="ghost" onClick={handmeZoomReset}>
          {Math.ceil(zoom * 100)}%
        </Button>
      </TooltipFull>
      <TooltipFull msg="Zoom In (Cmd +)" side="top">
        <Button display="ghost" onClick={handleZoomIn}>
          <IconZoomIn />
        </Button>
      </TooltipFull>
    </div>
  );
};

const Fullscreen: React.FC<{ project: ApiProject }> = ({ project }) => {
  return (
    <div className={cls.toolbar}>
      <TooltipFull msg="Fullscreen" side="top">
        <Link to={`/${project.orgId}/${project.slug}/flow`}>
          <Button display="ghost">
            <IconMaximize />
          </Button>
        </Link>
      </TooltipFull>
    </div>
  );
};

const AddComponents: React.FC = () => {
  const previewService = useRef<HTMLDivElement>(null);
  const previewHosting = useRef<HTMLDivElement>(null);

  // NB: it's not a button because the dragEvent does not work somehow
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
        role="button"
        tabIndex={0}
      >
        <IconCode /> Service
      </div>
      <div
        className={cls.add}
        onDragStart={(event) => onDragStart(event, 'hosting')}
        draggable
        role="button"
        tabIndex={0}
      >
        <IconBox /> Host
      </div>
    </div>
  );
};

export type ToolbarProps = typeof Container & {
  Zoom: typeof ToolbarZoom;
  Fullscreen: typeof Fullscreen;
  Readonly: typeof Readonly;
  AddComponents: typeof AddComponents;
  Inner: typeof Inner;
};

export const Toolbar = Container as ToolbarProps;
Toolbar.Zoom = ToolbarZoom;
Toolbar.Fullscreen = Fullscreen;
Toolbar.Readonly = Readonly;
Toolbar.AddComponents = AddComponents;
Toolbar.Inner = Inner;
