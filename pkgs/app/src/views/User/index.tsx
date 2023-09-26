import { Route, Routes } from 'react-router-dom';

import { NotFound } from '@/components/NotFound';

import { UserShow } from './Show';

const User: React.FC = () => {
  return (
    <Routes>
      <Route path="/:user_id" element={<UserShow />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default User;
