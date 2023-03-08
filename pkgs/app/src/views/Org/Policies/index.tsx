import { useListPolicies } from '../../../api/policies';
import type { RouteOrg } from '../../../types/routes';

export const OrgPolicies: React.FC<{ params: RouteOrg }> = ({ params }) => {
  const res = useListPolicies({
    org_id: params.org_id!,
  });
  console.log(res.data);
  return <></>;
};
