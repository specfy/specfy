import { SiGithub } from '@icons-pack/react-simple-icons';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { useGetUser } from '../../../api';
import { titleSuffix } from '../../../common/string';
import { AvatarAuto } from '../../../components/AvatarAuto';
import { Container } from '../../../components/Container';
import { Flex } from '../../../components/Flex';
import { NotFound } from '../../../components/NotFound';
import type { RouteUser } from '../../../types/routes';

import cls from './index.module.scss';

export const UserShow: React.FC = () => {
  const tmpParams = useParams<Partial<RouteUser>>();
  const params = tmpParams as RouteUser;

  // Data fetch
  const get = useGetUser({ user_id: params.user_id });

  if (get.isFetching) {
    return (
      <Container>
        <div className={cls.main}>
          <Flex gap="l">
            <Skeleton circle width={60} height={60} />
            <Skeleton width={200} />
          </Flex>
          <br />
          <Skeleton width={200} count={2} />
        </div>
      </Container>
    );
  }

  if (!get.data) {
    return <NotFound />;
  }

  const user = get.data.data;
  return (
    <Container>
      <Helmet title={`${user.name} ${titleSuffix}`} />
      <div className={cls.main}>
        <Flex gap="l">
          <AvatarAuto user={user} size="xl" />
          <h4>{user.name}</h4>
        </Flex>
        <div className={cls.info}>
          {user.githubLogin && (
            <a href="">
              <Flex gap="l">
                <SiGithub />@{user.githubLogin}
              </Flex>
            </a>
          )}
        </div>
      </div>
    </Container>
  );
};
