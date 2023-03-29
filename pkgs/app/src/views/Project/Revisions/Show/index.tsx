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
  ResListRevisionBlobs,
  ReqPutRevision,
  ResCheckRevision,
  ResGetRevision,
  ApiUser,
  ApiRevision,
  ReqGetRevision,
} from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useListRevisionBlobs } from '../../../../api/blobs';
import {
  updateRevision,
  useGetRevision,
  useGetRevisionChecks,
} from '../../../../api/revisions';
import { getEmptyDoc } from '../../../../common/content';
import { diffTwoBlob } from '../../../../common/diff';
import { useRevisionStore } from '../../../../common/store';
import { Card } from '../../../../components/Card';
import { Container } from '../../../../components/Container';
import { ContentDoc } from '../../../../components/Content';
import { DiffCard } from '../../../../components/DiffCard';
import { Editor } from '../../../../components/Editor';
import { FakeInput } from '../../../../components/Input';
import { Checks } from '../../../../components/Revision/Checks';
import { ReviewBar } from '../../../../components/Revision/ReviewBar';
import { SidebarBlock } from '../../../../components/SidebarBlock';
import { StatusTag } from '../../../../components/StatusTag';
import { Time } from '../../../../components/Time';
import { UserList } from '../../../../components/UserList';
import type { BlobWithDiff } from '../../../../types/blobs';
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
  const [rev, setRev] = useState<ResGetRevision['data']>();
  const [blobs, setBlobs] = useState<ResListRevisionBlobs['data']>();
  const [checks, setChecks] = useState<ResCheckRevision['data']>();
  const [to] = useState(() => `/${params.org_id}/${params.project_slug}`);
  const qp: ReqGetRevision = {
    org_id: params.org_id,
    project_id: proj.id,
  };

  // diff
  const [diffs, setDiffs] = useState<BlobWithDiff[]>([]);

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
    if (!res.data) return;
    setRev(res.data.data);
    storeRevision.setCurrent(res.data.data);
  }, [res.data]);
  useEffect(() => {
    if (!resBlobs.data) return;
    setBlobs(resBlobs.data.data);
    storeRevision.setBlobs(resBlobs.data.data);
  }, [resBlobs.data]);
  useEffect(() => {
    if (!resChecks.data) return;
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
        ...rev,
        name: title,
        description,
        authors: authors!.map((u) => u.id),
        reviewers: reviewers!.map((u) => u.id),
      }
    );

    setSave(false);

    if (!up?.data?.done) {
      message.error('Revision could not saved');
      return;
    }

    message.success('Revision updated');
    setEdit(false);
  };

  const onClick = async (status: ApiRevision['status'], lock?: boolean) => {
    if (!rev) {
      return;
    }

    setSave(true);

    const body: ReqPutRevision = {
      ...rev,
      authors: rev.authors.map((u) => u.id),
      reviewers: rev.reviewers.map((u) => u.id),
    };
    const locked = typeof lock !== 'undefined' ? lock : body.locked;

    await updateRevision(
      { ...qp, revision_id: rev.id },
      { ...body, status, locked }
    );

    message.success('Revision updated');
    setSave(false);
  };

  const onMenuClick: MenuProps['onClick'] = async (e) => {
    if (e.key === 'lock') {
      await onClick(rev!.status, true);
    } else if (e.key === 'unlock') {
      await onClick(rev!.status, false);
    } else if (e.key === 'close') {
      await onClick('closed');
    } else if (e.key === 'reopen') {
      await onClick('draft');
    }
  };

  useEffect(() => {
    if (!blobs) {
      return;
    }

    const _diffs: BlobWithDiff[] = [];

    // Remove non modified fields
    for (const blob of blobs) {
      const diff = diffTwoBlob(blob);
      _diffs.push(diff);
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
    return <>Not found</>;
  }

  return (
    <Container className={cls.container}>
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
            <Checks rev={rev} checks={checks} qp={qp} onClick={onClick} />
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
        <SidebarBlock title="Reviewers">
          <UserList
            list={reviewers || rev.reviewers}
            params={qp}
            edit={edit}
            onChange={onChangeReviewer}
            exclude={authors || rev.authors}
          />
        </SidebarBlock>
      </div>

      {resBlobs.isLoading && (
        <div>
          <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
        </div>
      )}

      {!edit && <ReviewBar rev={rev} qp={qp} />}

      {diffs && (
        <div className={cls.staged}>
          {diffs.map((diff) => {
            return (
              <DiffCard
                key={diff.typeId}
                diff={diff}
                url={to}
                onRevert={() => null}
              />
            );
          })}
        </div>
      )}
    </Container>
  );
};
