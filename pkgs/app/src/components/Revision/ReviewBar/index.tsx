import type {
  ApiRevision,
  BlockLevelZero,
  GetRevision,
} from '@specfy/api/src/types/api';
import { IconCircleCheck } from '@tabler/icons-react';
import { Button, Typography, Space, App } from 'antd';
import classnames from 'classnames';
import { useState, useEffect, useRef } from 'react';
import { useClickAway } from 'react-use';

import { createComment } from '../../../api';
import { isError } from '../../../api/helpers';
import { getEmptyDoc } from '../../../common/content';
import { i18n } from '../../../common/i18n';
import { Editor } from '../../Editor';

import cls from './index.module.scss';

export const ReviewBar: React.FC<{
  rev: ApiRevision;
  qp: GetRevision['Querystring'];
}> = ({ rev, qp }) => {
  const { message } = App.useApp();

  const ref = useRef<HTMLDivElement>(null);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
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

  useClickAway(ref, () => {
    // Only close if we scrolled
    if (ref.current && ref.current.getBoundingClientRect().top <= 0) {
      setOpen(false);
    }
  });

  const onClickReview = (is: boolean) => {
    setOpen(is);
  };
  const onSubmitReview = async () => {
    const resComment = await createComment(
      { ...qp, revision_id: rev.id },
      {
        approval: true,
        content: review,
      }
    );
    if (isError(resComment)) {
      void message.error(i18n.errorOccurred);
      return;
    }

    void message.success('Revision approved');
    setOpen(false);
    setReview(getEmptyDoc());
  };

  return (
    <div className={classnames(cls.bar, open && cls.opened)} ref={ref}>
      <div className={cls.inner}>
        <Button
          type="default"
          disabled={!canReview}
          className={classnames(cls.reviewButton)}
          onClick={() => onClickReview(true)}
        >
          {rev.merged ? 'Reviewed' : 'Add Review'}
        </Button>
      </div>

      {open && (
        <div>
          <Typography className={cls.text}>
            <Typography.Title level={2}>Finish your review</Typography.Title>
            <Editor content={review} onUpdate={setReview} minHeight="150px" />
          </Typography>
          <Space className={cls.actions}>
            <Button onClick={() => onClickReview(false)} type="text">
              Cancel
            </Button>
            <Button
              onClick={onSubmitReview}
              type="primary"
              className={classnames(cls.reviewButton, cls.success)}
              icon={<IconCircleCheck />}
            >
              Approve
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};
