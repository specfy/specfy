import {
  CaretDownOutlined,
  HistoryOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import type { ApiProject, BlockLevelZero } from 'api/src/types/api';
import type { Change } from 'diff';
import { diffWordsWithSpace } from 'diff';
import { useEffect, useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { Link, useNavigate } from 'react-router-dom';

import { createRevision } from '../../../../api/revisions';
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

  // TODO: undo revert
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
          {/* |<Checkbox checked>Staged</Checkbox> */}
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

export const ProjectRevisionCreate: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // Global
  const { message } = App.useApp();
  const navigate = useNavigate();

  // Edition
  const edit = useEdit();
  const [edits, originals] = useMemo(() => {
    return [Object.entries(edit.edits), edit.getOriginals()];
  }, [edit.edits]);

  // Local
  const [lastComputed, setLastComputed] = useState<number>();
  const [computed, setComputed] = useState<Computed[]>([]);
  const [to] = useState(() => `/org/${params.org_id}/${params.project_slug}`);

  // Form
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  // TODO: keep those values in Edit Mode
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<BlockLevelZero>({
    type: 'doc',
    content: [{ type: 'paragraph' }],
  });

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

  useEffect(() => {
    setCanSubmit(title !== '' && description.content.length > 0);
  }, [title, description]);

  const handleRevert = (couple: string, field: string) => {
    // TODO: undo revert
    delete edit.edits[couple][field];
    edit.setEdits({ ...edit.edits });
    setLastComputed(-1);
  };

  const onSubmit = async () => {
    console.log('on finish?');
    const { id } = await createRevision({
      orgId: params.org_id,
      projectId: proj.id,
      parentId: null, // TODO: compute this
      title,
      description,
      changes: [], // TODO: compute this
    });
    message.success('Revision created');

    navigate(`/org/${params.org_id}/${params.project_slug}/r/${id}`);
  };

  if (!computed) {
    return <LoadingOutlined />;
  }

  return (
    <div>
      <Typography.Title level={3}>
        <>Changes ({computed.length})</>
      </Typography.Title>
      <div className={cls.propose}>
        <Card>
          <Form onFinish={onSubmit}>
            <Form.Item required name="title">
              <Input
                size="large"
                placeholder="Title"
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Item>
            <Editor
              content={description}
              onUpdate={setDescription}
              minHeight="100px"
              inputLike={true}
            />
            <Button
              type="primary"
              block
              disabled={!canSubmit}
              htmlType="submit"
            >
              Propose changes
            </Button>
          </Form>
        </Card>
      </div>
      <div className={cls.staged}>
        {computed.map((c) => {
          return <Update key={c.id} c={c} url={to} onRevert={handleRevert} />;
        })}
      </div>
    </div>
  );
};
