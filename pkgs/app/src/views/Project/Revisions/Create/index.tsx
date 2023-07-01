import { omit } from '@specfy/api/src/common/object';
import {
  flagRevisionApprovalEnabled,
  flagRevisionDescRequired,
} from '@specfy/api/src/models/revisions/constants';
import type {
  ApiBlobCreate,
  ApiProject,
  BlockLevelZero,
  PostRevision,
} from '@specfy/api/src/types/api';
import {
  IconGitPullRequest,
  IconGitPullRequestDraft,
} from '@tabler/icons-react';
import { App, Button, Checkbox, Form, Result, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

import { createRevision } from '../../../../api';
import { isError } from '../../../../api/helpers';
import { getEmptyDoc } from '../../../../common/content';
import { proposeTitle } from '../../../../common/diff';
import { i18n } from '../../../../common/i18n';
import originalStore, { useStagingStore } from '../../../../common/store';
import { titleSuffix } from '../../../../common/string';
import { Card } from '../../../../components/Card';
import { Container } from '../../../../components/Container';
import { DiffCard } from '../../../../components/DiffCard';
import { Editor } from '../../../../components/Editor';
import { Flex } from '../../../../components/Flex';
import { FakeInput } from '../../../../components/Input';
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
  // const storeProject = useProjectStore();
  // const storeComponents = useComponentsStore();
  // const storeDocuments = useDocumentsStore();
  const staging = useStagingStore();

  // Local
  const [to] = useState(() => `/${params.org_id}/${params.project_slug}`);

  // Form
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  // TODO: keep those values in Edit Mode
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<BlockLevelZero>(() =>
    getEmptyDoc(true)
  );
  const [autoMerge, setAutoMerge] = useState<boolean>(
    flagRevisionApprovalEnabled === false
  );

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

    setCanSubmit(
      title !== '' && flagRevisionDescRequired ? enoughContent : true
    );
  }, [title, description]);

  // TODO: reup this
  // const handleRevert = (
  //   type: ApiBlobWithPrevious['type'],
  //   typeId: string,
  //   key: string
  // ) => {
  //   if (type === 'project') {
  //     storeProject.revertField(key as any);
  //   } else if (type === 'component') {
  //     storeComponents.revertField(typeId, key as any);
  //   } else if (type === 'document') {
  //     storeDocuments.revertField(typeId, key as any);
  //   }
  //   // TODO: possibility to undo revert
  // };

  const handleRevertAll = () => {
    originalStore.revertAll(staging.diffs);
  };

  const onSubmit = async () => {
    const blobs: PostRevision['Body']['blobs'] = [];
    for (const diff of staging.diffs) {
      const change: ApiBlobCreate = omit(diff.blob, [
        'id',
        'orgId',
        'projectId',
        'diffs',
        'createdAt',
        'updatedAt',
        'previous',
      ]);

      if (change.type === 'document' && change.current) {
        // TODO: automate this?
        change.current = omit(change.current, [
          'authors',
          'approvedBy',
          'reviewers',
        ]);
      }

      blobs.push(change);
    }

    const res = await createRevision({
      orgId: params.org_id,
      projectId: proj.id,
      name: title,
      description,
      blobs,
      draft: !autoMerge,
    });

    if (isError(res)) {
      message.error(i18n.errorOccurred);
      return;
    }

    // Discard local changes
    originalStore.revertAll(staging.diffs);

    message.success('Revision created');
    navigate(
      `/${params.org_id}/${params.project_slug}/revisions/${res.id}?${
        autoMerge ? 'automerge=true' : ''
      }`
    );
  };

  if (staging.diffs.length === 0) {
    return (
      <Container className={cls.container}>
        <Helmet title={`Create Revision - ${proj.name} ${titleSuffix}`} />
        <Result
          icon={<IconGitPullRequest size="1em" />}
          title="No changes to commit..."
          extra={
            <Link to={to}>
              <Button type="primary">Back to Overview</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <Container className={cls.container}>
      <Helmet title={`Create Revision - ${proj.name} ${titleSuffix}`} />
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
                  key={'edit'}
                  content={description}
                  onUpdate={setDescription}
                  minHeight="100px"
                />
              </Typography>
            </Card.Content>
            <Card.Actions>
              <Flex gap="l">
                <Checkbox
                  type="checkbox"
                  checked={autoMerge}
                  onChange={(el) => setAutoMerge(el.target.checked)}
                >
                  Merge directly
                </Checkbox>
                <Button
                  type="primary"
                  disabled={!canSubmit}
                  htmlType="submit"
                  icon={<IconGitPullRequestDraft />}
                >
                  {autoMerge ? 'Propose and Merge' : 'Propose changes'}
                </Button>
              </Flex>
            </Card.Actions>
          </Form>
        </Card>
      </div>
      <div className={cls.right}></div>

      <div className={cls.reviewBar}>
        <div>
          {staging.count} pending {staging.count > 1 ? 'changes' : 'change'}
        </div>
        <Button onClick={() => handleRevertAll()}>Revert all</Button>
      </div>

      <div className={cls.staged}>
        <div className={cls.staged}>
          {staging.diffs.map((diff) => {
            return (
              <DiffCard
                key={diff.blob.typeId}
                diff={diff}
                url={to}
                onRevert={() => null}
              />
            );
          })}
        </div>
      </div>
    </Container>
  );
};
