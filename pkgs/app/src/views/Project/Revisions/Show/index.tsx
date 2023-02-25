import {
  CheckCircleFilled,
  ExclamationCircleOutlined,
  LoadingOutlined,
  PullRequestOutlined,
} from '@ant-design/icons';
import {
  IconEyeCheck,
  IconEyeOff,
  IconGitPullRequestClosed,
  IconLock,
  IconLockAccessOff,
} from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import {
  Input,
  App,
  Button,
  Drawer,
  Dropdown,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import type {
  ApiProject,
  BlockLevelZero,
  ResListRevisionBlobs,
  ReqPutRevision,
  ResCheckRevision,
  ResGetRevision,
  ApiUser,
} from 'api/src/types/api';
import classnames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useListRevisionBlobs } from '../../../../api/blobs';
import { createComment } from '../../../../api/comments';
import {
  mergeRevision,
  rebaseRevision,
  updateRevision,
  useGetRevision,
  useGetRevisionChecks,
} from '../../../../api/revisions';
import { diffTwoBlob } from '../../../../common/diff';
import { Card } from '../../../../components/Card';
import { ContentDoc } from '../../../../components/Content';
import type { ComputedForDiff } from '../../../../components/DiffRow';
import { DiffRow } from '../../../../components/DiffRow';
import { Editor } from '../../../../components/Editor';
import { getEmptyDoc } from '../../../../components/Editor/helpers';
import { FakeInput } from '../../../../components/Input';
import { SidebarBlock } from '../../../../components/SidebarBlock';
import { StatusTag } from '../../../../components/StatusTag';
import { Time } from '../../../../components/Time';
import { UserList } from '../../../../components/UserList';
import type { EditContextInterface } from '../../../../hooks/useEdit';
import type { RouteProject, RouteRevision } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectRevisionsShow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // Global
  const { message } = App.useApp();

  const more = useParams<Partial<RouteRevision>>();
  const [rev, setRev] = useState<ResGetRevision['data']>();
  const [blobs, setBlobs] = useState<ResListRevisionBlobs['data']>();
  const [checks, setChecks] = useState<ResCheckRevision['data']>();
  const [computed, setComputed] = useState<ComputedForDiff[]>([]);
  const [to] = useState(() => `/org/${params.org_id}/${params.project_slug}`);
  const qp = {
    org_id: params.org_id,
    project_id: proj.id,
    revision_id: more.revision_id!,
  };

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
    setRev(res.data?.data);
  }, [res.isFetched]);
  useEffect(() => {
    if (!resBlobs.data) return;
    setBlobs(resBlobs.data?.data);
  }, [resBlobs.isFetched]);
  useEffect(() => {
    if (!resChecks.data) return;
    setChecks(resChecks.data?.data);
  }, [resChecks.isFetched]);

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

    setTitle(rev.title);
    setDescription(rev.description);
    setAuthors([...rev.authors]);
    setReviewers([...rev.reviewers]);
  }, [edit, rev]);

  const actionsItems = useMemo(() => {
    if (!rev) {
      return;
    }

    return [
      rev.status === 'draft'
        ? {
            key: 'waiting',
            icon: <IconEyeCheck size={16} />,
            label: 'Set ready for Review',
          }
        : {
            key: 'draft',
            icon: <IconEyeOff size={16} />,
            label: 'Back to Draft',
          },
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

    const up = await updateRevision(qp, {
      ...rev,
      title,
      description,
      authors: authors!.map((u) => u.id),
      reviewers: reviewers!.map((u) => u.id),
    });

    setSave(false);

    if (!up?.data?.done) {
      message.error('Revision could not saved');
      return;
    }

    message.success('Revision updated');
    setEdit(false);
  };

  const onMenuClick: MenuProps['onClick'] = async (e) => {
    if (!rev) {
      return;
    }

    setSave(true);

    const body: ReqPutRevision = {
      ...rev,
      authors: rev.authors.map((u) => u.id),
      reviewers: rev.reviewers.map((u) => u.id),
    };

    if (e.key === 'lock') {
      await updateRevision(qp, { ...body, locked: true });
    } else if (e.key === 'unlock') {
      await updateRevision(qp, { ...body, locked: false });
    } else if (e.key === 'close') {
      await updateRevision(qp, { ...body, status: 'closed' });
    } else if (e.key === 'reopen') {
      await updateRevision(qp, { ...body, status: 'draft' });
    } else if (e.key === 'waiting') {
      await updateRevision(qp, { ...body, status: 'waiting' });
    } else if (e.key === 'draft') {
      await updateRevision(qp, { ...body, status: 'draft' });
    }

    message.success('Revision updated');
    setSave(false);
  };

  // --------- Review
  const [canReview, setCanReview] = useState<boolean>(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [review, setReview] = useState<BlockLevelZero>(getEmptyDoc());
  // const [viewedCount, setViewedCount] = useState(0);

  useEffect(() => {
    if (!rev) return;
    // Block if author
    setCanReview(
      rev.merged || rev.status === 'draft' || rev.status === 'closed'
        ? false
        : true
    );
  }, [rev]);

  const onClickReview = (open: boolean) => {
    setReviewOpen(open);
  };
  const onSubmitReview = async () => {
    const resComment = await createComment(
      {
        ...qp,
        revision_id: rev!.id,
      },
      {
        approval: true,
        content: review,
      }
    );

    if (!resComment?.data?.id) {
      message.error('Revision could not be approved');
      return;
    }

    message.success('Revision approved');
    setReviewOpen(false);
    setReview(getEmptyDoc());
  };

  // --------- Merge
  const [merging, setMerging] = useState<boolean>(false);

  useEffect(() => {
    if (!blobs) {
      return;
    }

    const cleaned: EditContextInterface['changes'] = [];
    const tmps: ComputedForDiff[] = [];

    // Remove non modified fields
    for (const blob of blobs) {
      const diff = diffTwoBlob(blob, blob.previous);
      tmps.push(...diff.computed);
      cleaned.push(diff.clean);
    }

    setComputed(tmps);
  }, [blobs, rev]);

  const onMerge = async () => {
    setMerging(true);
    const resMerge = await mergeRevision({
      org_id: params.org_id,
      project_id: proj.id,
      revision_id: rev!.id,
    });

    setTimeout(() => {
      setMerging(false);
      if (resMerge?.data?.done) {
        message.success('Revision merged');
      } else {
        message.error('Revision could not be merged');
      }
    }, 500);
  };

  // --------- Rebase
  const [rebasing, setRebasing] = useState<boolean>(false);

  const onClickRebase = async () => {
    setRebasing(true);
    const resRebase = await rebaseRevision({
      ...qp,
      revision_id: rev!.id,
    });

    setRebasing(false);

    if (!resRebase?.data?.done) {
      message.error('Revision could not be rebased');
      return;
    }

    message.success('Revision rebased');
  };

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
    <div className={cls.container}>
      <div className={cls.left}>
        <Card>
          <Card.Content>
            {!edit && (
              <div className={cls.mainTop}>
                <Typography.Title level={1} className={cls.title}>
                  {rev.title}
                </Typography.Title>
                <Space>
                  {save && <LoadingOutlined />}

                  <Dropdown.Button
                    menu={{ items: actionsItems, onClick: onMenuClick }}
                    overlayClassName={cls.editDropdown}
                    onClick={() => setEdit(true)}
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
                className={cls.titleInput}
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
                  content={description}
                  onUpdate={setDescription}
                  minHeight="100px"
                  inputLike={true}
                />
              )}
            </Typography>
          </Card.Content>

          {edit && (
            <div className={cls.merge}>
              <div className={classnames(cls.checkLine, cls.success)}>
                <div className={cls.label}></div>

                <Space className={cls.actions}>
                  <Button type="text" onClick={() => setEdit(false)}>
                    cancel
                  </Button>
                  <Button type="primary" onClick={onClickSave} loading={save}>
                    Save
                  </Button>
                </Space>
              </div>
            </div>
          )}
          {checks && !edit && (
            <div className={cls.merge}>
              {rev.status === 'approved' && (
                <div className={classnames(cls.checkLine, cls.success)}>
                  <div className={cls.label}>
                    <CheckCircleFilled /> Approved by
                    {checks?.reviews.map((one) => {
                      return <span key={one.id}>{one.user.name}</span>;
                    })}
                  </div>
                </div>
              )}
              {rev.status === 'waiting' && (
                <div className={classnames(cls.checkLine, cls.warning)}>
                  <div className={cls.label}>
                    <ExclamationCircleOutlined /> A review is required to merge
                  </div>
                </div>
              )}
              {!rev.merged && checks.outdatedBlobs.length > 0 && (
                <div className={classnames(cls.checkLine, cls.danger)}>
                  <div className={cls.label}>
                    <ExclamationCircleOutlined /> This revision is not up to
                    date
                  </div>
                  <div className={cls.actions}>
                    <Button
                      onClick={onClickRebase}
                      type="default"
                      loading={rebasing}
                    >
                      Rebase
                    </Button>
                  </div>
                </div>
              )}
              <div
                className={classnames(cls.checkLine, rev.merged && cls.merged)}
              >
                <Button
                  type={rev.merged ? 'ghost' : 'primary'}
                  icon={<PullRequestOutlined />}
                  disabled={!checks.canMerge}
                  loading={merging}
                  className={classnames(
                    cls.mergeButton,
                    checks.canMerge && !rev.merged && cls.success,
                    rev.merged && cls.merged
                  )}
                  onClick={onMerge}
                >
                  {rev.merged ? 'Merged' : 'Merge'}
                </Button>
                {rev.status === 'draft' && <>This revision is still in draft</>}
                {rev.status === 'closed' && (
                  <span>
                    This revision was closed <Time time={rev.closedAt!} />
                  </span>
                )}
                {rev.merged && (
                  <span>
                    <Time time={rev.mergedAt!} />
                  </span>
                )}
              </div>
            </div>
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

      {computed && !edit && (
        <div className={cls.reviewBar}>
          <Button
            type={'primary'}
            disabled={!canReview}
            className={classnames(cls.reviewButton, canReview && cls.success)}
            onClick={() => onClickReview(true)}
          >
            {rev.merged ? 'Reviewed' : 'Add Review'}
          </Button>
        </div>
      )}

      {computed && (
        <div className={cls.staged}>
          {computed.map((c) => {
            return (
              <DiffRow
                key={`${c.type}-${c.typeId}-${c.key}`}
                comp={c}
                url={to}
                onRevert={() => null}
              />
            );
          })}
        </div>
      )}

      <Drawer
        title="Review"
        placement="right"
        closable={true}
        onClose={() => onClickReview(false)}
        mask={false}
        open={reviewOpen}
        extra={
          <Space>
            <Button onClick={() => onClickReview(false)}>Cancel</Button>
            <Button
              onClick={onSubmitReview}
              type="primary"
              className={classnames(cls.reviewButton, cls.success)}
            >
              Approve
            </Button>
          </Space>
        }
      >
        <Typography>
          <Editor content={review} onUpdate={setReview} minHeight="300px" />
        </Typography>
      </Drawer>
    </div>
  );
};
