import type {
  ApiProject,
  ApiUser,
  GetRevision,
  ListRevisionBlobs,
} from '@specfy/models';
import { flagRevisionApprovalEnabled } from '@specfy/models/src/revisions/constants';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { useListRevisionBlobs, useGetRevision } from '../../../../api';
import { Card } from '../../../../components/Card';
import { Empty } from '../../../../components/Empty';
import { ListActivity } from '../../../../components/ListActivity';
import { NotFound } from '../../../../components/NotFound';
import { DiffCard } from '../../../../components/Revision/DiffCard';
import { RevisionMainCard } from '../../../../components/Revision/MainCard';
import { ReviewBar } from '../../../../components/Revision/ReviewBar';
import { SidebarBlock } from '../../../../components/Sidebar/Block';
import { UserList } from '../../../../components/UserList';
import type { BlobAndDiffs } from '../../../../types/blobs';
import type { RouteProject, RouteRevision } from '../../../../types/routes';

import cls from './index.module.scss';

import { diffTwoBlob } from '@/common/diff';
import { useRevisionStore } from '@/common/store';
import { titleSuffix } from '@/common/string';

export const ProjectRevisionsShow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // Global
  const storeRevision = useRevisionStore();

  const more = useParams<Partial<RouteRevision>>();
  const [rev, setRev] = useState<GetRevision['Success']['data']>();
  const [blobs, setBlobs] = useState<ListRevisionBlobs['Success']['data']>();
  const [to] = useState(() => `/${params.org_id}/${params.project_slug}`);
  const qp: GetRevision['Querystring'] = {
    org_id: params.org_id,
    project_id: proj.id,
  };
  const [authors, setAuthors] = useState<ApiUser[]>();
  const [reviewers, setReviewers] = useState<ApiUser[]>();

  // diff
  const [computing, setComputing] = useState(true);
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
    if (!rev) {
      return;
    }

    setAuthors([...rev.authors]);
    setReviewers([...rev.reviewers]);
  }, [rev]);

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
    setComputing(false);
  }, [blobs, rev]);

  // --------- Content
  if (res.isLoading && !rev) {
    return (
      <div className={cls.container}>
        <div className={cls.left}>
          <Card padded>
            <Skeleton width={150} height={40} />
            <Skeleton width={350} count={3} />
          </Card>
        </div>
        <div className={cls.sidebar}></div>
      </div>
    );
  }

  if (!rev) {
    return <NotFound />;
  }

  return (
    <div className={cls.container}>
      <Helmet title={`${rev.name} - ${proj.name} ${titleSuffix}`} />

      <div className={cls.left}>
        <RevisionMainCard rev={rev} />

        {computing && (
          <div>
            <Skeleton count={3} />
          </div>
        )}

        {flagRevisionApprovalEnabled && <ReviewBar rev={rev} qp={qp} />}

        <div>
          {!computing && (
            <div className={cls.staged}>
              {diffs.length > 0 ? (
                diffs.map((diff) => {
                  return (
                    <DiffCard
                      key={diff.blob.typeId}
                      diff={diff}
                      url={to}
                      onRevert={() => null}
                      defaultHide={diffs.length > 20}
                    />
                  );
                })
              ) : (
                <Empty title="Empty diff..." />
              )}
            </div>
          )}
        </div>
      </div>

      <div className={cls.sidebar}>
        <SidebarBlock title="Authors">
          <UserList list={authors || rev.authors} />
        </SidebarBlock>
        {false && (
          <SidebarBlock title="Reviewers">
            <UserList list={reviewers || rev!.reviewers} />
          </SidebarBlock>
        )}
        <SidebarBlock title="Activities">
          <ListActivity
            orgId={rev.orgId}
            projectId={rev.projectId}
            revisionId={rev.id}
          />
        </SidebarBlock>
      </div>
    </div>
  );
};
