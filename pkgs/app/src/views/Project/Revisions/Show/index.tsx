import { flagRevisionApprovalEnabled } from '@specfy/api/src/models/revisions/constants';
import type {
  ApiProject,
  ApiUser,
  ApiRevision,
  GetRevision,
  ListRevisionBlobs,
  ListRevisionChecks,
} from '@specfy/api/src/types/api';
import {
  IconDotsVertical,
  IconGitPullRequestClosed,
  IconLock,
  IconLockAccessOff,
} from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
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
import { Container } from '../../../../components/Container';
import { ContentDoc } from '../../../../components/Content';
import { Editor } from '../../../../components/Editor';
import { Flex } from '../../../../components/Flex';
import { Button } from '../../../../components/Form/Button';
import { FakeInput } from '../../../../components/Form/FakeInput';
import { ListActivity } from '../../../../components/ListActivity';
import { Loading } from '../../../../components/Loading';
import { NotFound } from '../../../../components/NotFound';
import { Checks } from '../../../../components/Revision/Checks';
import { DiffCard } from '../../../../components/Revision/DiffCard';
import { ReviewBar } from '../../../../components/Revision/ReviewBar';
import { StatusTag } from '../../../../components/Revision/StatusTag';
import { SidebarBlock } from '../../../../components/Sidebar/Block';
import { Time } from '../../../../components/Time';
import { UserList } from '../../../../components/UserList';
import { useToast } from '../../../../hooks/useToast';
import type { BlobAndDiffs } from '../../../../types/blobs';
import type { RouteProject, RouteRevision } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectRevisionsShow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // Global
  const toast = useToast();
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

    setChecks(resChecks.data.data);
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
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    if (!up.data.done) {
      toast.add({ title: 'Revision could not saved', status: 'error' });
      return;
    }

    toast.add({ title: 'Revision updated', status: 'success' });
    setEdit(false);
  };

  const patchStatus = async (status: ApiRevision['status']) => {
    if (!rev) {
      return;
    }

    setSave(true);
    await updateRevision({ ...qp, revision_id: rev.id }, { status });
    toast.add({ title: 'Revision updated', status: 'success' });
    setSave(false);
  };
  const patchLocked = async (locked: boolean) => {
    if (!rev) {
      return;
    }

    setSave(true);
    await updateRevision({ ...qp, revision_id: rev.id }, { locked });
    toast.add({ title: 'Revision updated', status: 'success' });
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
    setComputing(false);
  }, [blobs, rev]);

  // --------- Content
  if (res.isLoading && !rev) {
    return (
      <Container noPadding className={cls.container}>
        <Container.Left2Third className={cls.left}>
          <div className={cls.main}>
            <div className={cls.card}>
              <div className={cls.mainTop}>
                <Skeleton width={150} height={40} />
              </div>
              <div className={cls.content}>
                <Skeleton width={350} count={3} />
              </div>
            </div>
          </div>
        </Container.Left2Third>
      </Container>
    );
  }

  if (!rev) {
    return <NotFound />;
  }

  return (
    <div>
      <Container noPadding className={cls.container}>
        <Container.Left2Third className={cls.left}>
          <Helmet title={`${rev.name} - ${proj.name} ${titleSuffix}`} />

          <div className={cls.main}>
            <div className={cls.card}>
              {!edit && (
                <div className={cls.mainTop}>
                  <h2 className={cls.title}>{rev.name}</h2>
                  <Flex>
                    {save && <Loading />}

                    <Dropdown.Button
                      menu={{ items: actionsItems, onClick: onMenuClick }}
                      overlayClassName={cls.editDropdown}
                      onClick={() => setEdit(true)}
                      icon={<IconDotsVertical />}
                    >
                      Edit
                    </Dropdown.Button>
                  </Flex>
                </div>
              )}
              {edit && (
                <FakeInput.H2
                  size="l"
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

              <div className={cls.content}>
                {!edit && <ContentDoc doc={rev.description} />}
                {edit && (
                  <Editor
                    key={rev.id}
                    content={description}
                    onUpdate={setDescription}
                    minHeight="100px"
                  />
                )}
              </div>
            </div>

            {edit && (
              <div className={cls.editSave}>
                <Flex>
                  <Button display="ghost" onClick={() => setEdit(false)}>
                    cancel
                  </Button>
                  <Button
                    display="primary"
                    onClick={onClickSave}
                    loading={save}
                  >
                    Save
                  </Button>
                </Flex>
              </div>
            )}

            {checks && !edit && (
              <Checks rev={rev} checks={checks} qp={qp} onClick={patchStatus} />
            )}
          </div>

          {computing && (
            <div>
              <Skeleton count={3} />
            </div>
          )}

          {flagRevisionApprovalEnabled && !edit && (
            <ReviewBar rev={rev} qp={qp} />
          )}
        </Container.Left2Third>
        <Container.Right1Third>
          <div className={cls.sidebar}>
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
            <SidebarBlock title="Activities">
              <ListActivity
                orgId={rev.orgId}
                projectId={rev.projectId}
                revisionId={rev.id}
              />
            </SidebarBlock>
          </div>
        </Container.Right1Third>
      </Container>

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
              <div className={cls.noDiff}>Empty diff...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
