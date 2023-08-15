import type { ApiRevision, BlockLevelZero, GetRevision } from '@specfy/models';
import { IconCircleCheck } from '@tabler/icons-react';
import classnames from 'classnames';
import { useState, useEffect, useRef } from 'react';
import { useClickAway } from 'react-use';

import { createComment } from '../../../api';
import { isError } from '../../../api/helpers';
import { getEmptyDoc } from '../../../common/content';
import { i18n } from '../../../common/i18n';
import { useToast } from '../../../hooks/useToast';
import { Editor } from '../../Editor';
import { Flex } from '../../Flex';
import { Button } from '../../Form/Button';

import cls from './index.module.scss';

export const ReviewBar: React.FC<{
  rev: ApiRevision;
  qp: GetRevision['Querystring'];
}> = ({ rev, qp }) => {
  const toast = useToast();

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
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Revision approved', status: 'success' });
    setOpen(false);
    setReview(getEmptyDoc());
  };

  return (
    <div className={classnames(cls.bar, open && cls.opened)} ref={ref}>
      <div className={cls.inner}>
        <Button
          disabled={!canReview}
          className={classnames(cls.reviewButton)}
          onClick={() => onClickReview(true)}
        >
          {rev.merged ? 'Reviewed' : 'Add Review'}
        </Button>
      </div>

      {open && (
        <div>
          <div className={cls.text}>
            <h2>Finish your review</h2>
            <Editor content={review} onUpdate={setReview} minHeight="150px" />
          </div>
          <Flex className={cls.actions}>
            <Button onClick={() => onClickReview(false)} display="ghost">
              Cancel
            </Button>
            <Button
              onClick={onSubmitReview}
              display="primary"
              className={classnames(cls.reviewButton, cls.success)}
            >
              <IconCircleCheck />
              Approve
            </Button>
          </Flex>
        </div>
      )}
    </div>
  );
};
