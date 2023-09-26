import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { Button } from '../Form/Button';
import { useProjectStore } from '@/common/store';
import { titleSuffix } from '@/common/string';

import cls from './index.module.scss';

export const NotFound: React.FC<{ title?: string; message?: string }> = ({
  title = 404,
  message = 'Sorry, the page you visited does not exist.',
}) => {
  const { project } = useProjectStore();
  return (
    <div className={cls.notfound}>
      <Helmet title={`404 ${titleSuffix}`} />
      <div className={cls.content}>
        <h2>{title}</h2>
        <p>{message}</p>

        <Link
          to={project ? `/${project.orgId}/${project.slug}` : '/'}
          className={cls.action}
        >
          <Button display="primary">Back Home</Button>
        </Link>
      </div>
    </div>
  );
};
