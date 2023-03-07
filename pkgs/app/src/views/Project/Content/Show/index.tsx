import type { ApiProject } from 'api/src/types/api';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import type { RouteDocument } from '../../../../types/routes';
import { Playbook } from '../Playbook';
import { RFC } from '../RFC';

export const DocumentShow: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const params = useParams<Partial<RouteDocument>>() as RouteDocument;

  const type = useMemo(() => {
    const slug = params.document_slug.split('-');
    if (!slug[0] || (slug[0] !== 'rfc' && slug[0] !== 'pb')) {
      return;
    }

    return slug[0];
  }, [params]);

  if (type === 'rfc') {
    return <RFC proj={proj} />;
  }

  return <Playbook proj={proj} />;
};
