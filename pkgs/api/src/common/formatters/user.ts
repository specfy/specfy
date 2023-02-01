import type { User } from '../../models';
import type { ApiUser } from '../../types/api/me';

export function toApiUser(user: User): ApiUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
