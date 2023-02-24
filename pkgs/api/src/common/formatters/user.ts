import type { User } from '../../models';
import type { ApiUser } from '../../types/api';

export function toApiUser(user: User): ApiUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
