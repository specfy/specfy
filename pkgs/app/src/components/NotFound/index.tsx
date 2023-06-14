import { Button } from 'antd';
import { Link } from 'react-router-dom';

import cls from './index.module.scss';

export const NotFound: React.FC = () => {
  return (
    <div className={cls.notfound}>
      <div className={cls.content}>
        <h2>404</h2>
        <p>Sorry, the page you visited does not exist.</p>

        <Link to="/">
          <Button type="primary">Back Home</Button>
        </Link>
      </div>
    </div>
  );
};
