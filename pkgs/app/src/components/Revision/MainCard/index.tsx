import type {
  ApiRevision,
  GetRevision,
  ListRevisionChecks,
} from '@specfy/models';
import {
  IconDotsVertical,
  IconGitPullRequestClosed,
  IconLock,
  IconLockAccessOff,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { updateRevision, useGetRevisionChecks } from '../../../api';
import { isError } from '../../../api/helpers';
import { Card } from '../../../components/Card';
import { ContentDoc } from '../../../components/Content';
import * as Dropdown from '../../../components/Dropdown';
import { Editor } from '../../../components/Editor';
import { Flex } from '../../../components/Flex';
import { Button } from '../../../components/Form/Button';
import { FakeInput } from '../../../components/Form/FakeInput';
import { Loading } from '../../../components/Loading';
import { Checks } from '../../../components/Revision/Checks';
import { StatusTag } from '../../../components/Revision/StatusTag';
import { Time } from '../../../components/Time';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import type { RouteRevision } from '../../../types/routes';

import cls from './index.module.scss';

import { getEmptyDoc } from '@/common/content';
import { i18n } from '@/common/i18n';

export const RevisionMainCard: React.FC<{ rev: ApiRevision }> = ({ rev }) => {
  const { currentPerm } = useAuth();
  const toast = useToast();
  const canEdit = currentPerm?.role !== 'viewer';

  const more = useParams<Partial<RouteRevision>>();
  const [checks, setChecks] = useState<ListRevisionChecks['Success']['data']>();
  const qp: GetRevision['Querystring'] = {
    org_id: more.org_id!,
    project_id: rev.projectId,
  };

  // --------- Data
  const resChecks = useGetRevisionChecks({
    ...qp,
    revision_id: rev?.id,
  });
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
  const [description, setDescription] = useState(getEmptyDoc());

  useEffect(() => {
    if (!rev) {
      return;
    }

    setTitle(rev.name);
    setDescription(rev.description);
  }, [rev]);
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
    const res = await updateRevision(
      { ...qp, revision_id: rev.id },
      { status }
    );
    setSave(false);

    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Revision updated', status: 'success' });
  };
  const patchLocked = async (locked: boolean) => {
    if (!rev) {
      return;
    }

    setSave(true);
    const res = await updateRevision(
      { ...qp, revision_id: rev.id },
      { locked }
    );
    setSave(false);

    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Revision updated', status: 'success' });
  };

  const onMenuClick = async (type: 'close' | 'lock' | 'reopen' | 'unlock') => {
    if (type === 'lock') {
      await patchLocked(true);
    } else if (type === 'unlock') {
      await patchLocked(false);
    } else if (type === 'close') {
      await patchStatus('closed');
    } else if (type === 'reopen') {
      await patchStatus('draft');
    }
  };

  return (
    <Card>
      <div className={cls.card}>
        {!edit && (
          <div className={cls.top}>
            <h2 className={cls.title}>{rev.name}</h2>
            <Flex>
              {save && <Loading />}

              {canEdit && <Button onClick={() => setEdit(true)}>Edit</Button>}

              {canEdit && (
                <Dropdown.Menu>
                  <Dropdown.Trigger asChild>
                    <Button display="ghost">
                      <IconDotsVertical />
                    </Button>
                  </Dropdown.Trigger>
                  <Dropdown.Portal>
                    <Dropdown.Content>
                      <Dropdown.Group>
                        {!rev.locked ? (
                          <Dropdown.Item asChild>
                            <Button
                              display="item"
                              onClick={() => onMenuClick('lock')}
                            >
                              <IconLock /> Lock
                            </Button>
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item asChild>
                            <Button
                              display="item"
                              onClick={() => onMenuClick('unlock')}
                            >
                              <IconLockAccessOff /> Unlock
                            </Button>
                          </Dropdown.Item>
                        )}
                        {!rev.closedAt ? (
                          <Dropdown.Item asChild>
                            <Button
                              display="item"
                              onClick={() => onMenuClick('close')}
                            >
                              <IconGitPullRequestClosed /> Close
                            </Button>
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item asChild>
                            <Button
                              display="item"
                              onClick={() => onMenuClick('reopen')}
                            >
                              <IconGitPullRequestClosed /> Open
                            </Button>
                          </Dropdown.Item>
                        )}
                      </Dropdown.Group>
                    </Dropdown.Content>
                  </Dropdown.Portal>
                </Dropdown.Menu>
              )}
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
            <Button display="primary" onClick={onClickSave} loading={save}>
              Save
            </Button>
          </Flex>
        </div>
      )}

      {checks && !edit && (
        <Checks
          rev={rev}
          checks={checks}
          qp={qp}
          onClick={patchStatus}
          canEdit={canEdit}
        />
      )}
    </Card>
  );
};
