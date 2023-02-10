import { Typography } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import { useMemo } from 'react';

import { Container } from '../../../../components/Container';
import { useEdit } from '../../../../hooks/useEdit';
import type { RouteProject } from '../../../../types/routes';

export const ProjectRevisionCurrent: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const edit = useEdit();
  const edits = useMemo(() => {
    return Object.values(edit.edits);
  }, [edit.edits]);

  return (
    <Container>
      <Typography.Title level={3}>
        <>Updates ({edits.length})</>
      </Typography.Title>
      {edits.map((type, i) => {
        return <div key={i}>{JSON.stringify(type)}</div>;
      })}
    </Container>
  );
};
