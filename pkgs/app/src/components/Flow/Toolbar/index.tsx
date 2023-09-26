import {
  IconBox,
  IconCode,
  IconLifebuoy,
  IconLock,
  IconMaximize,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';
import classnames from 'classnames';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useReactFlow, useViewport } from 'reactflow';

import { PreviewNode } from '../CustomNode';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import * as Popover from '@/components/Popover';
import { TooltipFull } from '@/components/Tooltip';
import { useAuth } from '@/hooks/useAuth';

import cls from './index.module.scss';

import type React from 'react';

const Container: React.FC<{
  top?: true;
  left?: true;
  right?: true;
  bottom?: true;
  center?: true;
  visible?: boolean;
  children: React.ReactNode;
}> = ({ children, top, left, right, bottom, center, visible }) => {
  return (
    <div
      className={classnames(
        cls.menu,
        top && cls.top,
        left && cls.left,
        right && cls.right,
        bottom && cls.bottom,
        visible && cls.visible,
        center && cls.center
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

const Readonly: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { currentPerm } = useAuth();
  const label = useMemo(() => {
    return currentPerm?.role !== 'viewer' ? 'Click to edit' : 'Read-Only';
  }, [currentPerm]);
  const handleClick = () => {
    if (currentPerm?.role !== 'viewer') {
      onClick();
    }
  };

  return (
    <div className={classnames(cls.toolbar, cls.dark)} onClick={handleClick}>
      <button>
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

const ToolbarHelp: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title = 'Need help?',
  children,
}) => {
  return (
    <div className={cls.toolbar}>
      <Popover.Popover>
        <Popover.Trigger asChild>
          <Button display="ghost">
            <IconLifebuoy />
          </Button>
        </Popover.Trigger>
        <Popover.Content className={cls.help}>
          <h3>{title}</h3>
          {children}
        </Popover.Content>
      </Popover.Popover>
    </div>
  );
};

const Fullscreen: React.FC<{ to: string }> = ({ to }) => {
  return (
    <div className={cls.toolbar}>
      <TooltipFull msg="Fullscreen" side="top">
        <Link to={`/${to}/flow`}>
          <Button display="ghost">
            <IconMaximize />
          </Button>
        </Link>
      </TooltipFull>
    </div>
  );
};

const AddComponents: React.FC = () => {
  const { zoom } = useViewport();
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
          transform: `translate(-10000px, -10000px)`,
          position: 'absolute',
          pointerEvents: 'none',
          display: 'flex',
          gap: '40px',
        }}
      >
        <div ref={previewService}>
          <div style={{ transform: `scale(${Math.max(0.2, zoom - 0.15)})` }}>
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
        </div>
        <div ref={previewHosting}>
          <div style={{ transform: `scale(${Math.max(0.2, zoom - 0.15)})` }}>
            <PreviewNode
              info={false}
              forceDisplay="hosting"
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
      </div>
      <Flex column>
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
      </Flex>
    </div>
  );
};

export type ToolbarProps = typeof Container & {
  Zoom: typeof ToolbarZoom;
  Fullscreen: typeof Fullscreen;
  Readonly: typeof Readonly;
  AddComponents: typeof AddComponents;
  Inner: typeof Inner;
  Help: typeof ToolbarHelp;
};

export const Toolbar = Container as ToolbarProps;
Toolbar.Zoom = ToolbarZoom;
Toolbar.Fullscreen = Fullscreen;
Toolbar.Readonly = Readonly;
Toolbar.AddComponents = AddComponents;
Toolbar.Inner = Inner;
Toolbar.Help = ToolbarHelp;
