import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { titleSuffix } from '../../common/string';
import { Button } from '../Form/Button';

import cls from './index.module.scss';

export const NotFound: React.FC<{ title?: string; message?: string }> = ({
  title = 404,
  message = 'Sorry, the page you visited does not exist.',
}) => {
  return (
    <div className={cls.notfound}>
      <Helmet title={`404 ${titleSuffix}`} />
      <div className={cls.content}>
        <h2>{title}</h2>
        <p>{message}</p>

        <Link to="/">
          <Button display="primary">Back Home</Button>
        </Link>
      </div>
    </div>
  );
};
