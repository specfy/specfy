import {
  CheckCircleFilled,
  ExclamationCircleOutlined,
  PullRequestOutlined,
} from '@ant-design/icons';
import { App, Button, Drawer, Skeleton, Space, Typography } from 'antd';
import type { ApiProject, BlockLevelZero } from 'api/src/types/api';
import type { ResListRevisionBlobs } from 'api/src/types/api/blob';
import type {
  ResCheckRevision,
  ResGetRevision,
} from 'api/src/types/api/revisions';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useListRevisionBlobs } from '../../../../api/blobs';
import { createComment } from '../../../../api/comments';
import {
  mergeRevision,
  rebaseRevision,
  useGetRevision,
  useGetRevisionChecks,
} from '../../../../api/revisions';
import { diffTwoBlob } from '../../../../common/diff';
import { ContentDoc } from '../../../../components/Content';
import type { ComputedForDiff } from '../../../../components/DiffRow';
import { DiffRow } from '../../../../components/DiffRow';
import { Editor } from '../../../../components/Editor';
import { getEmptyDoc } from '../../../../components/Editor/helpers';
import { StatusTag } from '../../../../components/StatusTag';
import { Time } from '../../../../components/Time';
import { UserCard } from '../../../../components/UserCard';
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

  // --------- Review
  const [canReview, setCanReview] = useState<boolean>(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [review, setReview] = useState<BlockLevelZero>(getEmptyDoc());
  // const [viewedCount, setViewedCount] = useState(0);

  useEffect(() => {
    if (!rev) return;
    // Block if author
    setCanReview(rev.merged ? false : true);
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
  }, [blobs]);

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
        <div className={cls.card}>
          <div className={cls.main}>
            <Typography.Title level={1} className={cls.title}>
              {rev.title}
            </Typography.Title>

            <div className={cls.subtitle}>
              <StatusTag
                status={rev.status}
                locked={rev.locked}
                merged={rev.merged}
              />{' '}
              opened <Time time={rev.createdAt} />
            </div>

            <Typography className={cls.content}>
              <ContentDoc doc={rev.description} />
            </Typography>
          </div>

          {checks && (
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
                    <ExclamationCircleOutlined /> Waiting for one review
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
        </div>
      </div>

      <div className={cls.right}>
        <div className={cls.infoBlock}>
          <div className={cls.infoHeader}>Authors</div>
          <ul className={cls.userList}>
            {rev.authors.map((user) => {
              return (
                <li key={user.id}>
                  <UserCard name={user.name} size="small" />
                </li>
              );
            })}
          </ul>
        </div>
        <div className={cls.infoBlock}>
          <div className={cls.infoHeader}>Reviewers</div>
          <ul className={cls.userList}>
            {rev.reviewers.map((user) => {
              return (
                <li key={user.id}>
                  <UserCard name={user.name} size="small" />
                </li>
              );
            })}
            {rev.reviewers.length <= 0 && (
              <Typography.Text type="secondary">
                No one assigned
              </Typography.Text>
            )}
          </ul>
        </div>
      </div>

      {resBlobs.isLoading && (
        <div>
          <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
        </div>
      )}

      {computed && (
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
              <DiffRow key={c.typeId} comp={c} url={to} onRevert={() => null} />
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
        <Editor content={review} onUpdate={setReview} minHeight="300px" />
      </Drawer>
    </div>
  );
};
