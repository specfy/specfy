import { Route, Routes } from 'react-router-dom';

import type { ApiOrg } from '@specfy/models';

import { OrgCatalogList } from './List';
import { OrgCatalogShow } from './Show';

export const OrgCatalog: React.FC<{ org: ApiOrg }> = ({ org }) => {
  return (
    <Routes>
      <Route path="/" element={<OrgCatalogList org={org} />} />
      <Route path="/:tech_id" element={<OrgCatalogShow org={org} />} />
    </Routes>
  );
};
