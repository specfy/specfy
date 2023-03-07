import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';
import { Button, Tooltip } from 'antd';
import classnames from 'classnames';
import { useEffect, useState } from 'react';

import { useGraph } from '../../../hooks/useGraph';

import cls from './index.module.scss';

import '@antv/x6-react-components/es/toolbar/style/index.css';

const ToolbarContainer: React.FC<{
  position: 'bottom' | 'top';
  visible?: boolean;
  children: React.ReactElement | React.ReactElement[];
}> = ({ children, position, visible }) => {
  return (
    <div
      className={classnames(cls.menu, cls[position], visible && cls.visible)}
    >
      {children}
    </div>
  );
};

const ToolbarMain: React.FC = () => {
  return <div className={cls.toolbar}></div>;
};

const ToolbarZoom: React.FC = () => {
  const gref = useGraph();
  const graph = gref.getRef();

  const [zoom, setZoom] = useState('100');

  useEffect(() => {
    if (!graph) {
      return;
    }

    graph.on('scale', () => {
      setZoom((parseFloat(graph.zoom().toFixed(1)) * 100).toFixed(0));
    });

    graph.bindKey('cmd+-', (e) => {
      e.preventDefault();
      handleZoomOut();
    });
    graph.bindKey(['cmd+plus', 'cmd+shift+plus'], (e) => {
      e.preventDefault();
      handleZoomIn();
    });
  }, [gref, graph]);

  function handleZoomIn() {
    if (!graph || graph.zoom() > 2.5) {
      return;
    }

    graph.zoom(0.1);
  }
  function handleZoomOut() {
    if (!graph || graph.zoom() < 0.2) {
      return;
    }

    graph.zoom(-0.1);
  }
  function handmeZoomReset() {
    if (!graph) {
      return;
    }

    graph.center();
    // graph.zoomTo(1);
    graph.zoomToFit({ padding: 40 });
  }

  return (
    <div className={cls.toolbar}>
      <Tooltip title="Zoom In (Cmd +)" placement="bottom">
        <Button
          className={cls.toolbarItem}
          icon={<IconZoomIn />}
          type="text"
          onClick={handleZoomIn}
        />
      </Tooltip>
      <Tooltip title="Reset to fit" placement="bottom">
        <Button
          className={cls.toolbarItem}
          type="text"
          onClick={handmeZoomReset}
        >
          {zoom}%
        </Button>
      </Tooltip>
      <Tooltip title="Zoom Out (Cmd -)" placement="bottom">
        <Button
          className={cls.toolbarItem}
          icon={<IconZoomOut />}
          type="text"
          onClick={handleZoomOut}
        />
      </Tooltip>
    </div>
  );
};

export const ToolbarHistory: React.FC = () => {
  const gref = useGraph();
  const graph = gref.getRef();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!graph) {
      return;
    }

    graph.on('history:add', () => {
      setCanUndo(graph.canUndo());
      setCanRedo(graph.canRedo());
    });
    graph.on('history:undo', () => {
      setCanUndo(graph.canUndo());
      setCanRedo(graph.canRedo());
    });
    graph.on('history:redo', () => {
      setCanUndo(graph.canUndo());
      setCanRedo(graph.canRedo());
    });
  }, [gref]);

  function handleUndo() {
    if (!graph) {
      return;
    }

    graph.undo();
  }
  function handleRedo() {
    if (!graph) {
      return;
    }

    graph.redo();
  }

  return (
    <div className={cls.toolbar}>
      <Tooltip title="Undo (Cmd +)" placement="bottom">
        <Button
          className={cls.toolbarItem}
          icon={<IconArrowBackUp />}
          type="text"
          onClick={handleUndo}
          disabled={!canUndo}
        />
      </Tooltip>
      <Tooltip title="Redo (Cmd -)" placement="bottom">
        <Button
          className={cls.toolbarItem}
          icon={<IconArrowForwardUp />}
          type="text"
          onClick={handleRedo}
          disabled={!canRedo}
        />
      </Tooltip>
    </div>
  );
};

export type ToolbarProps = typeof ToolbarContainer & {
  Zoom: typeof ToolbarZoom;
  Main: typeof ToolbarMain;
  History: typeof ToolbarHistory;
};

export const Toolbar = ToolbarContainer as ToolbarProps;
Toolbar.Zoom = ToolbarZoom;
Toolbar.Main = ToolbarMain;
Toolbar.History = ToolbarHistory;
