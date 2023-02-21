import {
  CheckCircleFilled,
  CloseCircleOutlined,
  MinusCircleOutlined,
  PullRequestOutlined,
} from '@ant-design/icons';
import { Button, Card, Skeleton, Typography } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import type { ResListRevisionBlobs } from 'api/src/types/api/blob';
import type { ResGetRevision } from 'api/src/types/api/revisions';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useListRevisionBlobs } from '../../../../api/blobs';
import { useGetRevision } from '../../../../api/revisions';
import { diffTwoBlob } from '../../../../common/diff';
import { ContentDoc } from '../../../../components/Content';
import type { ComputedForDiff } from '../../../../components/DiffRow';
import { DiffRow } from '../../../../components/DiffRow';
import { RFCStatusTag } from '../../../../components/RFCStatusTag';
import { Time } from '../../../../components/Time';
import { UserCard } from '../../../../components/UserCard';
import type { EditContextInterface } from '../../../../hooks/useEdit';
import type { RouteProject, RouteRevision } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectRevisionsShow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const more = useParams<Partial<RouteRevision>>();
  const [rev, setRev] = useState<ResGetRevision['data']>();
  const [blobs, setBlobs] = useState<ResListRevisionBlobs['data']>();
  const [computed, setComputed] = useState<ComputedForDiff[]>([]);
  const [to] = useState(() => `/org/${params.org_id}/${params.project_slug}`);

  // Data fetching
  const res = useGetRevision({
    org_id: params.org_id,
    project_id: proj.id,
    revision_id: more.revision_id!,
  });
  const resBlobs = useListRevisionBlobs({
    org_id: params.org_id,
    project_id: proj.id,
    revision_id: rev?.id,
  });

  useEffect(() => {
    setRev(res.data?.data);
  }, [res.isFetched]);
  useEffect(() => {
    setBlobs(resBlobs.data?.data);
  }, [resBlobs.isFetched]);

  // Merge status
  const [canMerge, setCanMerge] = useState<boolean>();

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

  useEffect(() => {
    if (!rev) return;
    setCanMerge(rev.status === 'approved' && !rev.merged);
  }, [rev]);

  if (res.isLoading) {
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
              <RFCStatusTag
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

          <div className={cls.merge}>
            {rev.status === 'approved' && (
              <div className={classnames(cls.checkLine, cls.success)}>
                <CheckCircleFilled /> Approved
              </div>
            )}
            {rev.status === 'rejected' && (
              <div className={classnames(cls.checkLine, cls.danger)}>
                <CloseCircleOutlined /> Rejected
              </div>
            )}
            {rev.status === 'waiting' && (
              <div className={classnames(cls.checkLine, cls.warning)}>
                <MinusCircleOutlined /> Waiting for one review
              </div>
            )}
            <div
              className={classnames(cls.checkLine, rev.merged && cls.merged)}
            >
              <Button
                type={rev.merged ? 'ghost' : 'primary'}
                icon={<PullRequestOutlined />}
                disabled={!canMerge}
                className={classnames(
                  cls.mergeButton,
                  canMerge && cls.success,
                  rev.merged && cls.merged
                )}
              >
                {rev.merged ? 'Merged' : 'Merge'}
              </Button>
              {rev.status === 'draft' && <>This revision is still in draft</>}
              {rev.status === 'rejected' && <>Requires one approval to merge</>}
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
        <div className={cls.staged}>
          {computed.map((c) => {
            return (
              <DiffRow key={c.typeId} comp={c} url={to} onRevert={() => null} />
            );
          })}
        </div>
      )}
    </div>
  );
};
