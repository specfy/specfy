import { IconGitPullRequestDraft } from '@tabler/icons-react';
import { App, Button, Form, Typography } from 'antd';
import type {
  ApiBlobWithPrevious,
  ApiProject,
  BlockLevelZero,
  ReqPostRevision,
} from 'api/src/types/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createRevision } from '../../../../api/revisions';
import { proposeTitle } from '../../../../common/diff';
import originalStore, {
  useStagingStore,
  useProjectStore,
  useComponentsStore,
  useDocumentsStore,
} from '../../../../common/store';
import { Card } from '../../../../components/Card';
import { Container } from '../../../../components/Container';
import { DiffCard } from '../../../../components/DiffCard';
import { Editor } from '../../../../components/Editor';
import { FakeInput } from '../../../../components/Input';
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
  const storeProject = useProjectStore();
  const storeComponents = useComponentsStore();
  const storeDocuments = useDocumentsStore();
  const staging = useStagingStore();

  // Local
  const [to] = useState(() => `/${params.org_id}/${params.project_slug}`);

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
    setTitle(proposeTitle(staging.diffs));
  }, [staging]);

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

  const handleRevert = (
    type: ApiBlobWithPrevious['type'],
    typeId: string,
    key: string
  ) => {
    if (type === 'project') {
      storeProject.revertField(key as any);
    } else if (type === 'component') {
      storeComponents.revertField(typeId, key as any);
    } else if (type === 'document') {
      storeDocuments.revertField(typeId, key as any);
    }
    // TODO: possibility to undo revert
  };

  const handleRevertAll = () => {
    originalStore.revertAll(staging.diffs);
  };

  const onSubmit = async () => {
    const blobs: ReqPostRevision['blobs'] = [];
    for (const {
      id,
      orgId,
      projectId,
      diffs,
      createdAt,
      updatedAt,
      previous,
      ...change
    } of staging.diffs) {
      blobs.push(change);
    }

    const { id } = await createRevision({
      orgId: params.org_id,
      projectId: proj.id,
      name: title,
      description,
      blobs,
    });

    // Discard local changes
    originalStore.revertAll(staging.diffs);

    message.success('Revision created');
    navigate(`/${params.org_id}/${params.project_slug}/revisions/${id}`);
  };

  if (staging.diffs.length === 0) {
    return <>No changes to commit...</>;
  }

  return (
    <Container className={cls.container}>
      <div className={cls.left}>
        <Card>
          <Form onFinish={onSubmit}>
            <Card.Content>
              <FakeInput.H1
                size="large"
                value={title}
                placeholder="Revision title..."
                onChange={(e) => setTitle(e.target.value)}
              />

              <Typography>
                <Editor
                  content={description}
                  onUpdate={setDescription}
                  minHeight="100px"
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

      <div className={cls.reviewBar}>
        <div>
          {staging.diffs.length} pending{' '}
          {staging.diffs.length > 1 ? 'changes' : 'change'}
        </div>
        <Button onClick={() => handleRevertAll()}>Revert all</Button>
      </div>

      <div className={cls.staged}>
        <div className={cls.staged}>
          {staging.diffs.map((diff) => {
            return (
              <DiffCard
                key={diff.typeId}
                diff={diff}
                url={to}
                onRevert={() => null}
              ></DiffCard>
            );
          })}
        </div>
      </div>
    </Container>
  );
};
