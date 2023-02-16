import { LoadingOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import type { ApiProject, BlockLevelZero } from 'api/src/types/api';
import { diffWordsWithSpace } from 'diff';
import { useEffect, useMemo, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { useNavigate } from 'react-router-dom';

import { createRevision } from '../../../../api/revisions';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import type {
  EditChange,
  EditContextInterface,
} from '../../../../hooks/useEdit';
import { isDiff, useEdit } from '../../../../hooks/useEdit';
import type { RouteProject } from '../../../../types/routes';

import type { ComputedForDiff } from './Diff';
import { Diff } from './Diff';
import cls from './index.module.scss';

export const ProjectRevisionCreate: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // Global
  const { message } = App.useApp();
  const navigate = useNavigate();

  // Edition
  const edit = useEdit();
  const changes = useMemo(() => {
    return edit.changes;
  }, [edit.changes]);

  // Local
  const [lastComputed, setLastComputed] = useState<number>();
  const [computed, setComputed] = useState<ComputedForDiff[]>([]);
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
    if (!changes || !edit.lastUpdate) {
      return;
    }
    if (lastComputed && edit.lastUpdate.getTime() <= lastComputed) {
      return;
    }

    const cleaned: EditContextInterface['changes'] = [];
    const tmps: ComputedForDiff[] = [];

    // Remove non modified fields
    for (const { type, id, values, original } of changes) {
      const clean: EditChange = { type, id, original, values: {} };

      for (const [key, value] of Object.entries(values)) {
        if (!isDiff(original[key], value)) {
          continue;
        }

        clean.values[key] = value;
        const a = <ContentDoc doc={original[key]} />;
        const b = <ContentDoc doc={value} />;
        const tmp: ComputedForDiff = {
          type,
          id,
          key,
          original: original,
          diff: diffWordsWithSpace(
            renderToString(a).replaceAll('<!-- -->', ''),
            renderToString(b).replaceAll('<!-- -->', '')
          ),
        };
        tmps.push(tmp);
      }
      cleaned.push(clean);
    }

    const now = Date.now();
    setComputed(tmps);
    setLastComputed(now);
    setTimeout(() => {
      edit.setChanges(cleaned);
    }, 1);
  }, [changes]);

  useEffect(() => {
    setCanSubmit(title !== '' && description.content.length > 0);
  }, [title, description]);

  const handleRevert = (type: string, id: string, key: string) => {
    // TODO: possibility to undo revert
    edit.revert(type, id, key);
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

  if (!edit.lastUpdate || edit.changes.length === 0 || computed.length === 0) {
    return <>No changes to commit...</>;
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
          return <Diff key={c.id} comp={c} url={to} onRevert={handleRevert} />;
        })}
      </div>
    </div>
  );
};
