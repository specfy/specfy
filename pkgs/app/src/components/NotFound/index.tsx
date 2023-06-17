import { Button } from 'antd';
import { Link } from 'react-router-dom';

import cls from './index.module.scss';

export const NotFound: React.FC<{ title?: string; message?: string }> = ({
  title = 404,
  message = 'Sorry, the page you visited does not exist.',
}) => {
  return (
    <div className={cls.notfound}>
      <div className={cls.content}>
        <h2>{title}</h2>
        <p>{message}</p>

        <Link to="/">
          <Button type="primary">Back Home</Button>
        </Link>
      </div>
    </div>
  );
};
