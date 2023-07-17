import { omit } from '@specfy/api/src/common/object';
import { componentsToFlow } from '@specfy/api/src/models/flows/transform';
import type { ComputedFlow } from '@specfy/api/src/models/flows/types';
import {
  flagRevisionApprovalEnabled,
  flagRevisionDescRequired,
} from '@specfy/api/src/models/revisions/constants';
import type {
  ApiBlobCreate,
  ApiComponent,
  ApiProject,
  BlockLevelZero,
  PostRevision,
} from '@specfy/api/src/types/api';
import {
  IconGitPullRequest,
  IconGitPullRequestDraft,
} from '@tabler/icons-react';
import { Button, Checkbox, Form, Result, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

import { createRevision } from '../../../../api';
import { isError } from '../../../../api/helpers';
import { getEmptyDoc } from '../../../../common/content';
import { proposeTitle } from '../../../../common/diff';
import { i18n } from '../../../../common/i18n';
import originalStore, {
  useComponentsStore,
  useStagingStore,
} from '../../../../common/store';
import { titleSuffix } from '../../../../common/string';
import { Card } from '../../../../components/Card';
import { Container } from '../../../../components/Container';
import { DiffCard } from '../../../../components/DiffCard';
import { DiffFlow } from '../../../../components/DiffCard/Flow';
import { Editor } from '../../../../components/Editor';
import { Flex } from '../../../../components/Flex';
import { FlowWrapper } from '../../../../components/Flow';
import { Toolbar } from '../../../../components/Flow/Toolbar';
import { FakeInput } from '../../../../components/Form/FakeInput';
import { useToast } from '../../../../hooks/useToast';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectRevisionCreate: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // Global
  const toast = useToast();
  const navigate = useNavigate();

  // Edition
  const staging = useStagingStore();
  const storeComponents = useComponentsStore();

  // Local
  const [to] = useState(() => `/${params.org_id}/${params.project_slug}`);
  const [flow, setFlow] = useState<ComputedFlow>();
  const [previousFlow, setPreviousFlow] = useState<ComputedFlow>();

  // Form
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  // TODO: keep those values in Edit Mode
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<BlockLevelZero>(() =>
    getEmptyDoc(true)
  );
  const [autoMerge, setAutoMerge] = useState<boolean>(
    !flagRevisionApprovalEnabled
  );

  // Compute changes
  useEffect(() => {
    setTitle(proposeTitle(staging.diffs));
    if (staging.hasGraphChanged) {
      setFlow(componentsToFlow(Object.values(storeComponents.components)));

      const oldComponents = originalStore.originalStore.filter((old) => {
        return 'edges' in old && old.projectId === proj.id;
      }) as ApiComponent[];
      setPreviousFlow(componentsToFlow(oldComponents));
    }
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
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    // Discard local changes
    originalStore.revertAll(staging.diffs);

    toast.add({ title: 'Revision created', status: 'success' });
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
              <Flex gap="l" column align="flex-start">
                <FakeInput.H1
                  size="large"
                  value={title}
                  placeholder="Revision title..."
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div style={{ width: '100%' }}>
                  <Typography>
                    <Editor
                      key={'edit'}
                      content={description}
                      onUpdate={setDescription}
                      minHeight="100px"
                    />
                  </Typography>
                </div>
              </Flex>
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
          {flow && (
            <FlowWrapper style={{ height: '350px' }}>
              <DiffFlow next={flow} prev={previousFlow!} />

              <Toolbar bottom>
                <Toolbar.Zoom />
              </Toolbar>
            </FlowWrapper>
          )}
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
