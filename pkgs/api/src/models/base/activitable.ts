import type { Transactionable } from 'sequelize';
import { Model } from 'sequelize-typescript';

import type { DBActivity, DBActivityType } from '../../types/db';
import { Activity } from '../activity';
import type { User } from '../user';

export default abstract class ActivitableModel<
  TModelAttributes extends Record<string, any> = any,
  TCreationAttributes extends Record<string, any> = TModelAttributes
> extends Model<TModelAttributes, TCreationAttributes> {
  abstract activityType: DBActivityType;

  async onActivity(
    this: this & { id?: string; orgId?: string; projectId?: string },
    action: DBActivity['action'],
    user: User,
    opts?: Transactionable
  ): Promise<Activity> {
    let orgId: string;
    let projectId: string | null = null;
    if (this.activityType === 'Org') {
      orgId = this.id!;
    } else if (this.activityType === 'Project') {
      projectId = this.id!;
      orgId = this.orgId!;
    } else {
      orgId = this.orgId!;
      projectId = this.projectId || null;
    }

    return await Activity.create(
      {
        action,
        userId: user.id,
        orgId: orgId!,
        projectId,
        [`target${this.activityType}Id`]: this.id,
      },
      opts
    );
  }

  async onAfterCreate(user: User, opts?: Transactionable): Promise<Activity> {
    return this.onActivity(`${this.activityType}.created`, user, opts);
  }

  async onAfterUpdate(user: User, opts?: Transactionable): Promise<Activity> {
    return this.onActivity(`${this.activityType}.updated`, user, opts);
  }

  async onAfterDelete(user: User, opts?: Transactionable): Promise<Activity> {
    return this.onActivity(`${this.activityType}.deleted`, user, opts);
  }
}
