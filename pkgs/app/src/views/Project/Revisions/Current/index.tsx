import {
  CaretDownOutlined,
  HistoryOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Typography } from 'antd';
import type { ApiProject, BlockLevelZero } from 'api/src/types/api';
import type { Change } from 'diff';
import { diffWordsWithSpace } from 'diff';
import { useEffect, useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { Link } from 'react-router-dom';

import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import type { EditContextInterface } from '../../../../hooks/useEdit';
import { isDiff, useEdit } from '../../../../hooks/useEdit';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

interface Computed {
  id: string;
  couple: string;
  name: string;
  original: any;
  diff: Change[];
}

export const Update: React.FC<{
  c: Computed;
  url: string;
  onRevert: (couple: string, field: string) => void;
}> = ({ c, url, onRevert }) => {
  const [left] = useState(() => {
    return c.diff
      .map((d) => {
        if (d.added) return null;
        if (d.removed) return <span className={cls.removed}>{d.value}</span>;
        else return d.value;
      })
      .filter((e) => e);
  });
  const [right] = useState(() => {
    return c.diff
      .map((d) => {
        if (d.removed) return null;
        if (d.added) return <span className={cls.added}>{d.value}</span>;
        else return d.value;
      })
      .filter((e): e is string => !!e);
  });
  const type = 'type' in c.original ? 'Components' : 'Project';
  const to = url + (type === 'Components' ? `/c/${c.original.slug}` : '');

  return (
    <div className={cls.update}>
      <div className={cls.title}>
        <div className={cls.titleLeft}>
          <div className={cls.toggle}>
            <CaretDownOutlined />
          </div>
          <Link to={to}>
            {type} / {c.original.name} [{c.name}]
          </Link>
        </div>
        <div className={cls.titleRight}>
          <Button
            type="text"
            icon={<HistoryOutlined />}
            size="small"
            onClick={() => onRevert(c.couple, c.name)}
          >
            Revert
          </Button>
          |<Checkbox checked>Staged</Checkbox>
        </div>
      </div>
      <div className={cls.diff}>
        <div className={cls.left}>
          {!left.length ? (
            <span className={cls.empty}>Empty...</span>
          ) : (
            <>{left}</>
          )}
        </div>
        <div className={cls.right}>
          {!right.length ? (
            <span className={cls.empty}>Deleted...</span>
          ) : (
            <>{right}</>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProjectRevisionCurrent: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const edit = useEdit();
  const [edits, originals] = useMemo(() => {
    return [Object.entries(edit.edits), edit.getOriginals()];
  }, [edit.edits]);

  const [lastComputed, setLastComputed] = useState<number>();
  const [computed, setComputed] = useState<Computed[]>([]);
  const [description, setDescription] = useState<BlockLevelZero>({
    type: 'doc',
    content: [{ type: 'paragraph' }],
  });
  const [to] = useState(() => `/org/${params.org_id}/${params.project_slug}`);

  useEffect(() => {
    if (!edits || !originals) {
      return;
    }
    if (lastComputed && edit.lastUpdate <= lastComputed) {
      return;
    }

    const cleaned: EditContextInterface['edits'] = {};
    const tmps: Computed[] = [];

    for (const [couple, obj] of edits) {
      cleaned[couple] = {};

      for (const [key, value] of Object.entries(obj)) {
        if (!isDiff(originals[couple][key], value)) {
          continue;
        }

        cleaned[couple][key] = value;
        const a = <ContentDoc doc={originals[couple][key]} />;
        const b = <ContentDoc doc={value} />;
        const tmp: Computed = {
          id: `${couple}-${key}`,
          couple,
          name: key,
          original: originals[couple],
          diff: diffWordsWithSpace(
            renderToString(a).replaceAll('<!-- -->', ''),
            renderToString(b).replaceAll('<!-- -->', '')
          ),
        };
        tmps.push(tmp);
      }
    }

    const now = Date.now();
    setComputed(tmps);
    setLastComputed(now);
    setTimeout(() => edit.setEdits(cleaned), 1);
  }, [edits, originals]);

  const handleRevert = (couple: string, field: string) => {
    // TODO: undo revert
    delete edit.edits[couple][field];
    edit.setEdits({ ...edit.edits });
    setLastComputed(-1);
  };

  if (!computed) {
    return <LoadingOutlined />;
  }

  return (
    <div>
      <Typography.Title level={3}>
        <>Changes ({computed.length})</>
      </Typography.Title>
      <div className={cls.staged}>
        {computed.map((c) => {
          return <Update key={c.id} c={c} url={to} onRevert={handleRevert} />;
        })}
      </div>
      <div className={cls.propose}>
        <Card>
          <Typography.Title level={4}>Propose changes</Typography.Title>
          <Form.Item required>
            <Editor
              content={description}
              onUpdate={setDescription}
              minHeight="100px"
            />
          </Form.Item>
          <Button type="primary" block>
            Propose changes
          </Button>
        </Card>
      </div>
    </div>
  );
};
