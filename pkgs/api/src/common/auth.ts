// import SequelizeAdapter from '@next-auth/sequelize-adapter';

// import { db } from '../db';
// import { User, Account, Session, VerificationToken } from '../models';

// export const authOptions: AuthOptions = {
//   providers: [],
//   adapter: SequelizeAdapter(db, {
//     synchronize: false,
//     models: {
//       User: User as any,
//       Account: Account as any,
//       Session: Session as any,
//       VerificationToken: VerificationToken as any,
//     },
//   }),
// };

export const JWT_SECRET = 'abdfdjhfd';

export interface JWT {
  id: string;
  iat: string;
  type: 'session';
}
