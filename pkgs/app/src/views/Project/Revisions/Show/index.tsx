import { LoadingOutlined } from '@ant-design/icons';
import {
  IconDotsVertical,
  IconGitPullRequestClosed,
  IconLock,
  IconLockAccessOff,
} from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { App, Button, Dropdown, Skeleton, Space, Typography } from 'antd';
import type {
  ApiProject,
  ApiUser,
  ApiRevision,
  GetRevision,
  ListRevisionBlobs,
  ListRevisionChecks,
} from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import {
  useListRevisionBlobs,
  updateRevision,
  useGetRevision,
  useGetRevisionChecks,
} from '../../../../api';
import { isError } from '../../../../api/helpers';
import { getEmptyDoc } from '../../../../common/content';
import { diffTwoBlob } from '../../../../common/diff';
import { i18n } from '../../../../common/i18n';
import { useRevisionStore } from '../../../../common/store';
import { titleSuffix } from '../../../../common/string';
import { Card } from '../../../../components/Card';
import { Container } from '../../../../components/Container';
import { ContentDoc } from '../../../../components/Content';
import { DiffCard } from '../../../../components/DiffCard';
import { Editor } from '../../../../components/Editor';
import { FakeInput } from '../../../../components/Input';
import { NotFound } from '../../../../components/NotFound';
import { Checks } from '../../../../components/Revision/Checks';
import { ReviewBar } from '../../../../components/Revision/ReviewBar';
import { SidebarBlock } from '../../../../components/SidebarBlock';
import { StatusTag } from '../../../../components/StatusTag';
import { Time } from '../../../../components/Time';
import { UserList } from '../../../../components/UserList';
import type { BlobAndDiffs } from '../../../../types/blobs';
import type { RouteProject, RouteRevision } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectRevisionsShow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // Global
  const { message } = App.useApp();
  const storeRevision = useRevisionStore();

  const more = useParams<Partial<RouteRevision>>();
  const [rev, setRev] = useState<GetRevision['Success']['data']>();
  const [blobs, setBlobs] = useState<ListRevisionBlobs['Success']['data']>();
  const [checks, setChecks] = useState<ListRevisionChecks['Success']['data']>();
  const [to] = useState(() => `/${params.org_id}/${params.project_slug}`);
  const qp: GetRevision['Querystring'] = {
    org_id: params.org_id,
    project_id: proj.id,
  };

  // diff
  const [diffs, setDiffs] = useState<BlobAndDiffs[]>([]);

  // --------- Data fetching
  const res = useGetRevision({
    ...qp,
    revision_id: more.revision_id!,
  });
  const resBlobs = useListRevisionBlobs({
    ...qp,
    revision_id: rev?.id,
  });
  const resChecks = useGetRevisionChecks({
    ...qp,
    revision_id: rev?.id,
  });

  useEffect(() => {
    if (!res.data) {
      return;
    }

    setRev(res.data.data);
    storeRevision.setCurrent(res.data.data);
  }, [res.data]);

  useEffect(() => {
    if (!resBlobs.data) {
      return;
    }

    setBlobs(resBlobs.data.data);
    storeRevision.setBlobs(resBlobs.data.data);
  }, [resBlobs.data]);

  useEffect(() => {
    if (!resChecks.data) {
      return;
    }

    setChecks(resChecks.data?.data);
  }, [resChecks.data]);

  // --------- Edit
  const [edit, setEdit] = useState(false);
  const [save, setSave] = useState(false);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState<ApiUser[]>();
  const [reviewers, setReviewers] = useState<ApiUser[]>();
  const [description, setDescription] = useState(getEmptyDoc());

  useEffect(() => {
    if (!rev) {
      return;
    }

    setTitle(rev.name);
    setDescription(rev.description);
    setAuthors([...rev.authors]);
    setReviewers([...rev.reviewers]);
  }, [edit, rev]);

  const actionsItems = useMemo(() => {
    if (!rev) {
      return;
    }

    return [
      !rev.locked
        ? {
            key: 'lock',
            icon: <IconLock size={16} />,
            label: 'Lock',
          }
        : {
            key: 'unlock',
            icon: <IconLockAccessOff size={16} />,
            label: 'Unlock',
          },
      !rev.closedAt
        ? {
            key: 'close',
            icon: <IconGitPullRequestClosed size={16} />,
            label: 'Close',
            danger: true,
          }
        : {
            key: 'reopen',
            icon: <IconGitPullRequestClosed size={16} />,
            label: 'Reopen',
          },
    ];
  }, [rev]);

  const onChangeAuthor = (list: ApiUser[]) => {
    setAuthors([...list]);
  };
  const onChangeReviewer = (list: ApiUser[]) => {
    setReviewers([...list]);
  };

  const onClickSave = async () => {
    if (!rev) {
      return;
    }

    setSave(true);

    const up = await updateRevision(
      { ...qp, revision_id: rev.id },
      {
        name: title,
        description,
        authors: authors!.map((u) => u.id),
        reviewers: reviewers!.map((u) => u.id),
      }
    );
    setSave(false);

    if (isError(up)) {
      message.error(i18n.errorOccurred);
      return;
    }

    if (!up.data.done) {
      message.error('Revision could not saved');
      return;
    }

    message.success('Revision updated');
    setEdit(false);
  };

  const patchStatus = async (status: ApiRevision['status']) => {
    if (!rev) {
      return;
    }

    setSave(true);
    await updateRevision({ ...qp, revision_id: rev.id }, { status });
    message.success('Revision updated');
    setSave(false);
  };
  const patchLocked = async (locked: boolean) => {
    if (!rev) {
      return;
    }

    setSave(true);
    await updateRevision({ ...qp, revision_id: rev.id }, { locked });
    message.success('Revision updated');
    setSave(false);
  };

  const onMenuClick: MenuProps['onClick'] = async (e) => {
    if (e.key === 'lock') {
      await patchLocked(true);
    } else if (e.key === 'unlock') {
      await patchLocked(false);
    } else if (e.key === 'close') {
      await patchStatus('closed');
    } else if (e.key === 'reopen') {
      await patchStatus('draft');
    }
  };

  useEffect(() => {
    if (!blobs) {
      return;
    }

    const _diffs: BlobAndDiffs[] = [];

    // Remove non modified fields
    for (const blob of blobs) {
      _diffs.push({
        blob: blob as any,
        diffs: diffTwoBlob(blob) as any,
      });
    }

    setDiffs(_diffs);
  }, [blobs, rev]);

  // --------- Content
  if (res.isLoading && !rev) {
    return (
      <div>
        <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
      </div>
    );
  }

  if (!rev) {
    return <NotFound />;
  }

  return (
    <Container className={cls.container}>
      <Helmet title={`${rev.name} - ${proj.name} ${titleSuffix}`} />

      <div className={cls.left}>
        <Card>
          <Card.Content>
            {!edit && (
              <div className={cls.mainTop}>
                <Typography.Title level={1} className={cls.title}>
                  {rev.name}
                </Typography.Title>
                <Space>
                  {save && <LoadingOutlined />}

                  <Dropdown.Button
                    menu={{ items: actionsItems, onClick: onMenuClick }}
                    overlayClassName={cls.editDropdown}
                    onClick={() => setEdit(true)}
                    icon={<IconDotsVertical />}
                  >
                    Edit
                  </Dropdown.Button>
                </Space>
              </div>
            )}
            {edit && (
              <FakeInput.H1
                size="large"
                value={title}
                placeholder="Title..."
                onChange={(e) => setTitle(e.target.value)}
              />
            )}

            <div className={cls.subtitle}>
              <StatusTag
                status={rev.status}
                locked={rev.locked}
                merged={rev.merged}
              />{' '}
              opened <Time time={rev.createdAt} />
            </div>

            <Typography className={cls.content}>
              {!edit && <ContentDoc doc={rev.description} />}
              {edit && (
                <Editor
                  key={rev.id}
                  content={description}
                  onUpdate={setDescription}
                  minHeight="100px"
                />
              )}
            </Typography>
          </Card.Content>

          {edit && (
            <div className={cls.editSave}>
              <Space>
                <Button type="text" onClick={() => setEdit(false)}>
                  cancel
                </Button>
                <Button type="primary" onClick={onClickSave} loading={save}>
                  Save
                </Button>
              </Space>
            </div>
          )}

          {checks && !edit && (
            <Checks rev={rev} checks={checks} qp={qp} onClick={patchStatus} />
          )}
        </Card>
      </div>

      <div className={cls.right}>
        <SidebarBlock title="Authors">
          <UserList
            list={authors || rev.authors}
            params={qp}
            edit={edit}
            onChange={onChangeAuthor}
            exclude={reviewers || rev.reviewers}
          />
        </SidebarBlock>
        {false && (
          <SidebarBlock title="Reviewers">
            <UserList
              list={reviewers || rev!.reviewers}
              params={qp}
              edit={edit}
              onChange={onChangeReviewer}
              exclude={authors || rev!.authors}
            />
          </SidebarBlock>
        )}
      </div>

      {resBlobs.isLoading && (
        <div>
          <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
        </div>
      )}

      {!edit && <ReviewBar rev={rev} qp={qp} />}

      <div className={cls.staged}>
        {diffs.length > 0 ? (
          diffs.map((diff) => {
            return (
              <DiffCard
                key={diff.blob.typeId}
                diff={diff}
                url={to}
                onRevert={() => null}
              />
            );
          })
        ) : (
          <div className={cls.noDiff}>Empty diff...</div>
        )}
      </div>
    </Container>
  );
};
