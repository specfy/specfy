import { flagRevisionApprovalEnabled } from '@specfy/api/src/models/revisions/constants';
import type {
  ApiRevision,
  ListRevisionChecks,
} from '@specfy/api/src/types/api';
import {
  IconCircleCheckFilled,
  IconExclamationCircle,
  IconGitPullRequest,
  IconEyeCheck,
  IconEyeOff,
} from '@tabler/icons-react';
import { Button } from 'antd';
import classnames from 'classnames';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMount, useSearchParam } from 'react-use';

import { mergeRevision, rebaseRevision } from '../../../api';
import { isError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
import { useToast } from '../../../hooks/useToast';
import { Time } from '../../Time';

import cls from './index.module.scss';

export const Checks: React.FC<{
  rev: ApiRevision;
  checks: ListRevisionChecks['Success']['data'];
  qp: ListRevisionChecks['Querystring'];
  onClick: (status: ApiRevision['status']) => void;
}> = ({ rev, checks, qp, onClick }) => {
  const toast = useToast();
  const autoMerge = useSearchParam('automerge');
  const navigate = useNavigate();
  const loc = useLocation();
  const [merging, setMerging] = useState<boolean>(false);

  const onMerge = async () => {
    setMerging(true);
    const resMerge = await mergeRevision({ ...qp, revision_id: rev.id });
    setMerging(false);
    if (isError(resMerge)) {
      toast.add({ title: 'Revision could not be merged', status: 'error' });
      return;
    }

    toast.add({ title: 'Revision merged', status: 'success' });
  };

  useMount(() => {
    if (autoMerge && checks.canMerge && !rev.merged) {
      setTimeout(onMerge, 500);
      navigate(loc.pathname, { replace: true });
    }
  });

  // --------- Rebase
  const [rebasing, setRebasing] = useState<boolean>(false);

  const onClickRebase = async () => {
    setRebasing(true);
    const resRebase = await rebaseRevision({ ...qp, revision_id: rev.id });

    setRebasing(false);

    if (isError(resRebase)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    if (!resRebase.data.done) {
      toast.add({ title: 'Revision could not be rebased', status: 'error' });
      return;
    }

    toast.add({ title: 'Revision rebased', status: 'success' });
  };

  return (
    <div className={cls.merge}>
      {rev.status === 'approved' && (
        <div className={classnames(cls.checkLine, cls.success)}>
          <div className={cls.label}>
            <IconCircleCheckFilled /> Approved by
            {checks.reviews.map((one) => {
              return <span key={one.id}>{one.user.name}</span>;
            })}
          </div>
        </div>
      )}

      {flagRevisionApprovalEnabled && rev.status === 'waiting' && (
        <div className={classnames(cls.checkLine, cls.warning)}>
          <div className={cls.label}>
            <IconExclamationCircle /> A review is required to merge
          </div>
        </div>
      )}

      {!rev.merged && checks.outdatedBlobs.length > 0 && (
        <div className={classnames(cls.checkLine, cls.danger)}>
          <div className={cls.label}>
            <IconExclamationCircle /> This revision is not up to date
          </div>
          <div>
            <Button onClick={onClickRebase} type="default" loading={rebasing}>
              Rebase
            </Button>
          </div>
        </div>
      )}

      <div className={classnames(cls.checkLine, rev.merged && cls.merged)}>
        <Button
          type={rev.merged ? 'ghost' : 'primary'}
          icon={<IconGitPullRequest />}
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
        <div className={cls.mergeAction}>
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
          {!rev.merged &&
            rev.status !== 'closed' &&
            (rev.status === 'draft' ? (
              <Button
                onClick={() => onClick('waiting')}
                icon={<IconEyeCheck size={16} />}
              >
                Set ready for Review
              </Button>
            ) : (
              <Button
                type="text"
                onClick={() => onClick('draft')}
                icon={<IconEyeOff size={16} />}
              >
                Convert to Draft
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
};
