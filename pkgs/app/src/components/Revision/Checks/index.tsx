import {
  IconCircleCheckFilled,
  IconExclamationCircle,
  IconGitPullRequest,
  IconEyeCheck,
  IconEyeOff,
} from '@tabler/icons-react';
import { App, Button } from 'antd';
import type { ApiRevision, ListRevisionChecks } from 'api/src/types/api';
import classnames from 'classnames';
import { useState } from 'react';

import { mergeRevision, rebaseRevision } from '../../../api';
import { isError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
import { Time } from '../../Time';

import cls from './index.module.scss';

export const Checks: React.FC<{
  rev: ApiRevision;
  checks: ListRevisionChecks['Success']['data'];
  qp: ListRevisionChecks['Querystring'];
  onClick: (status: ApiRevision['status']) => void;
}> = ({ rev, checks, qp, onClick }) => {
  const { message } = App.useApp();

  const [merging, setMerging] = useState<boolean>(false);

  const onMerge = async () => {
    setMerging(true);
    const resMerge = await mergeRevision({ ...qp, revision_id: rev.id });
    if (isError(resMerge)) {
      message.error(i18n.errorOccurred);
      return;
    }

    setMerging(false);
    if ('error' in resMerge) {
      message.error(i18n.errorOccurred);
      return;
    }

    message.success('Revision merged');
  };

  // --------- Rebase
  const [rebasing, setRebasing] = useState<boolean>(false);

  const onClickRebase = async () => {
    setRebasing(true);
    const resRebase = await rebaseRevision({ ...qp, revision_id: rev.id });

    setRebasing(false);

    if (isError(resRebase)) {
      message.error(i18n.errorOccurred);
      return;
    }

    if (!resRebase.data.done) {
      message.error('Revision could not be rebased');
      return;
    }

    message.success('Revision rebased');
  };

  return (
    <div className={cls.merge}>
      {rev.status === 'approved' && (
        <div className={classnames(cls.checkLine, cls.success)}>
          <div className={cls.label}>
            <IconCircleCheckFilled /> Approved by
            {checks?.reviews.map((one) => {
              return <span key={one.id}>{one.user.name}</span>;
            })}
          </div>
        </div>
      )}

      {rev.status === 'waiting' && (
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
