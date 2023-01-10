import { Card } from 'antd';
import { ListProjects } from '../../components/ListProjects';

export const Home: React.FC = () => {
  return (
    <Card>
      <ListProjects></ListProjects>
    </Card>
  );
};
