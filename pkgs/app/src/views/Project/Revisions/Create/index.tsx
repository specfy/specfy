import { LoadingOutlined } from '@ant-design/icons';
import { IconGitPullRequestDraft } from '@tabler/icons-react';
import { App, Button, Form, Input, Typography } from 'antd';
import type {
  ApiProject,
  BlockLevelZero,
  ReqPostRevision,
} from 'api/src/types/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createRevision } from '../../../../api/revisions';
import { diffTwoBlob, proposeTitle } from '../../../../common/diff';
import { Card } from '../../../../components/Card';
import type { ComputedForDiff } from '../../../../components/DiffRow';
import { DiffRow } from '../../../../components/DiffRow';
import { Editor } from '../../../../components/Editor';
import type { EditContextInterface } from '../../../../hooks/useEdit';
import { useEdit } from '../../../../hooks/useEdit';
import type { RouteProject } from '../../../../types/routes';

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
  const changes = edit.changes;

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

  // Compute changes
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
    for (const change of changes) {
      const res = diffTwoBlob(change, change.previous);
      tmps.push(...res.computed);
      cleaned.push(res.clean);
    }

    const now = new Date();
    setComputed(tmps);
    setLastComputed(now.getTime());
    setTimeout(() => {
      edit.setChanges(cleaned, now);
    }, 1);
    setTitle(proposeTitle(tmps));
  }, [changes, edit.lastUpdate]);

  // Can submit form?
  useEffect(() => {
    let enoughContent = description.content.length > 0;
    if (
      description.content.length === 1 &&
      description.content[0].type === 'paragraph' &&
      !description.content[0].content
    ) {
      // Placeholder
      enoughContent = false;
    }

    setCanSubmit(title !== '' && enoughContent);
  }, [title, description]);

  const handleRevert = (type: string, typeId: string, key: string) => {
    // TODO: possibility to undo revert
    edit.revert(type as any, typeId, key as any);
  };

  const onSubmit = async () => {
    const blobs: ReqPostRevision['blobs'] = [];
    for (const change of changes) {
      blobs.push({
        type: change.type,
        typeId: change.typeId,
        parentId: change.previous.blobId,
        blob: { ...change.previous, ...change.blob } as any,
        deleted: false,
      });
    }

    const { id } = await createRevision({
      orgId: params.org_id,
      projectId: proj.id,
      title,
      description,
      blobs,
    });

    // Discard local changes
    edit.enable(false);
    edit.setChanges([], new Date());

    message.success('Revision created');
    navigate(`/org/${params.org_id}/${params.project_slug}/revisions/${id}`);
  };

  if (!computed) {
    return <LoadingOutlined />;
  }

  if (!edit.lastUpdate || edit.changes.length === 0 || computed.length === 0) {
    return <>No changes to commit...</>;
  }

  return (
    <div className={cls.container}>
      <div className={cls.left}>
        <Card>
          <Form onFinish={onSubmit}>
            <Card.Content>
              <Typography.Title level={2}>Create Revision</Typography.Title>
              <Form.Item required name="title" initialValue={title}>
                <Input
                  size="large"
                  placeholder="Title"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Item>

              <Typography>
                <Editor
                  content={description}
                  onUpdate={setDescription}
                  minHeight="100px"
                  inputLike={true}
                />
              </Typography>
            </Card.Content>
            <Card.Actions>
              <Button
                type="primary"
                disabled={!canSubmit}
                htmlType="submit"
                icon={<IconGitPullRequestDraft />}
              >
                Propose changes
              </Button>
            </Card.Actions>
          </Form>
        </Card>
      </div>
      <div className={cls.right}></div>
      <div className={cls.staged}>
        {computed.map((c) => {
          return (
            <DiffRow key={c.typeId} comp={c} url={to} onRevert={handleRevert} />
          );
        })}
      </div>
    </div>
  );
};
