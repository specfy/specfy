import * as Form from '@radix-ui/react-form';
import { v1 } from '@specfy/models/src/billing/plans';
import { IconCircleCheckFilled, IconInfinity } from '@tabler/icons-react';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import type {
  ApiOrg,
  GetSubscription,
  UsageMetric,
  Plan,
} from '@specfy/models';

import { isError } from '@/api/helpers';
import {
  cancelSubscription,
  createSubscription,
  useGetSubscription,
  useGetUsage,
} from '@/api/stripe';
import { i18n } from '@/common/i18n';
import { titleSuffix } from '@/common/string';
import { Card } from '@/components/Card';
import * as Dialog from '@/components/Dialog';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import { Field } from '@/components/Form/Field';
import { SelectFull } from '@/components/Form/Select';
import { Textarea } from '@/components/Form/TextArea';
import { Loading } from '@/components/Loading';
import { Progress } from '@/components/Progress';
import { Tag } from '@/components/Tag';
import { Subdued } from '@/components/Text';
import { useToast } from '@/hooks/useToast';
import type { RouteOrg } from '@/types/routes';

import cls from './index.module.scss';

const plans = Object.values(v1);

export const PlanCard: React.FC<{
  orgId: string;
  plan: Plan;
  currentPlan?: Plan;
}> = ({ orgId, plan, currentPlan }) => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [changing, setChanging] = useState(false);

  const triggerPlan = async (key: string) => {
    setChanging(true);
    const res = await createSubscription({ org_id: orgId }, { priceKey: key });
    setChanging(false);
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    window.location.href = res.data.url;
  };

  const isCurrent =
    currentPlan?.id === plan.id || (plan.name === 'Free' && !currentPlan);
  return (
    <div
      key={plan.id}
      className={classNames(cls.plan, isCurrent && cls.current)}
    >
      <header className={cls.header}>
        <h4 className={cls.name}>{plan.name} </h4>
        <h3 className={cls.price}>
          <span className={classNames(plan.price.amount > 0 && cls.strike)}>
            ${plan.price.amount / 100}
          </span>{' '}
          <span className={cls.unit}>/ mo</span>
        </h3>
        {plan.price.amount > 0 && (
          <h3 className={cls.price}>
            Free <span className={cls.unit}> beta</span>
          </h3>
        )}
        {isCurrent && <Tag variant="border">Current Plan</Tag>}
      </header>
      <div className={cls.points}>
        <ul>
          <li className={cls.point}>
            <IconCircleCheckFilled className={cls.included} />
            {plan.project.max} Projects
          </li>
          <li className={cls.point}>
            <IconCircleCheckFilled className={cls.included} />
            {plan.user.max} Users
          </li>
          <li className={cls.point}>
            <IconCircleCheckFilled className={cls.included} />
            {plan.deploy.max === Infinity ? (
              'Unlimited deploy'
            ) : (
              <>{plan.deploy.max} Deploys /month</>
            )}
          </li>
          {plan.features.map((feature, i) => {
            return (
              <li className={cls.point} key={i}>
                <IconCircleCheckFilled className={cls.included} />
                {feature}
              </li>
            );
          })}
        </ul>
      </div>
      <footer className={cls.action}>
        {!isCurrent && (
          <>
            <Dialog.Dialog open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <Button block display="primary">
                  {currentPlan &&
                    plan.price.amount > currentPlan.price.amount &&
                    'Upgrade'}
                  {currentPlan &&
                    plan.price.amount < currentPlan.price.amount &&
                    'Downgrade'}
                  {!currentPlan && 'Change plan'}
                </Button>
              </Dialog.Trigger>
              <Dialog.Content style={{ width: '500px' }}>
                <Dialog.Header>
                  <Dialog.Title>Change your plan?</Dialog.Title>
                </Dialog.Header>
                <Dialog.Description>
                  <p>
                    If you upgrade you will be billed automatically. If you
                    downgrade you will be credited on your next invoice.
                  </p>
                </Dialog.Description>
                <Dialog.Footer>
                  <Dialog.Close asChild>
                    <Button key="back" display="ghost">
                      cancel
                    </Button>
                  </Dialog.Close>
                  <Button
                    key="submit"
                    display="primary"
                    loading={changing}
                    onClick={() => triggerPlan(plan.price.key)}
                  >
                    Change to {plan.name} plan
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Dialog>
          </>
        )}
      </footer>
    </div>
  );
};

const feedbacks = [
  { value: 'other', label: 'Other' },
  { value: 'low_quality', label: 'Does not match my expectation' },
  // { value: 'missing_features', label: 'Not enough features' },
  { value: 'switched_service', label: 'I have found another solution' },
  // { value: 'too_complex', label: 'Too complex' },
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'unused', label: "I'm not using it anymore" },
  // { value: 'customer_service', label: 'Poor customer service' },
];

const Usage: React.FC<{
  orgId: string;
  sub: GetSubscription['Success']['data'] | null;
  currentPlan?: Plan;
}> = ({ orgId, sub, currentPlan }) => {
  const toast = useToast();
  const getUsage = useGetUsage({ org_id: orgId });
  const [usage, setUsage] = useState<UsageMetric[]>();
  const [feedback, setFeedback] = useState<string>();
  const [comment, setComment] = useState<string>();
  const [cancelling, setCancelling] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getUsage.data) {
      return;
    }
    setUsage(Object.values(getUsage.data.data));
  }, [getUsage.data]);

  const [start, end] = useMemo(() => {
    if (!sub) {
      return [DateTime.now().toFormat('LLL yyyy'), null];
    }

    return [
      DateTime.fromMillis(sub.startAt * 1000).toFormat('LLL dd'),
      DateTime.fromMillis(sub.endAt * 1000).toFormat('LLL dd'),
    ];
  }, [sub]);

  const handleCancel: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setCancelling(true);

    const res = await cancelSubscription(
      { org_id: orgId },
      {
        comment,
        feedback,
      }
    );
    setCancelling(false);
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Subscription cancelled', status: 'success' });
    setOpen(false);
  };

  return (
    <Card padded large>
      <Flex justify="space-between">
        <h2>Usage {getUsage.isLoading && <Loading />}</h2>
        <div>
          {sub ? (
            <>
              {start} - {end}
            </>
          ) : (
            start
          )}
        </div>
      </Flex>

      <Flex justify="space-between" align="flex-end">
        <div className={cls.metrics}>
          {usage?.map((metric) => {
            return (
              <div key={metric.name}>
                <Flex justify="space-between" className={cls.metric}>
                  <span>{metric.name}</span>
                  {usage && (
                    <span>
                      {metric.current}
                      <span className={cls.unit}>
                        /{!metric.max ? <IconInfinity /> : metric.max}
                      </span>
                    </span>
                  )}
                </Flex>
                <Progress value={metric.pct} />
              </div>
            );
          })}
        </div>
        <div>
          <Flex column align="flex-end" gap="l">
            <div>
              Plan: <strong>{currentPlan?.name || 'Free'}</strong>{' '}
            </div>
            {sub?.cancelAt && (
              <Tag>
                Until:{' '}
                {DateTime.fromMillis(sub.cancelAt * 1000).toFormat(
                  'dd LLLL yyyy'
                )}
              </Tag>
            )}
            {sub && !sub.cancelAt && (
              <>
                <Dialog.Dialog open={open} onOpenChange={setOpen}>
                  <Dialog.Trigger asChild>
                    <Button size="s" danger>
                      Cancel subscription
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Content style={{ width: '500px' }}>
                    <Form.Root onSubmit={handleCancel}>
                      <Dialog.Header>
                        <Dialog.Title>Cancel you subscription?</Dialog.Title>
                      </Dialog.Header>
                      <Dialog.Description>
                        <p>
                          Your subscription will stop at the end of the billing
                          period:
                          <br />
                          <strong>
                            {DateTime.fromMillis(sub.endAt * 1000).toFormat(
                              'dd LLLL yyyy'
                            )}
                          </strong>
                        </p>
                        <br />
                        <p>
                          If you have more Projects and Users than the free plan
                          allows, they won&apos;t be deleted but you won&apos;t
                          be able to create new one or invite new users.
                        </p>
                      </Dialog.Description>
                      <Dialog.Description>
                        <Field name="feedback" label="Feedback">
                          <SelectFull
                            value={feedback}
                            onValueChange={setFeedback}
                            options={feedbacks}
                            placeholder="Give us a feedback"
                          />
                        </Field>
                        {feedback === 'other' && (
                          <Field name="comment" label="Comment">
                            <Textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                          </Field>
                        )}
                      </Dialog.Description>
                      <Dialog.Footer>
                        <Dialog.Close asChild>
                          <Button key="back" display="ghost">
                            abort
                          </Button>
                        </Dialog.Close>
                        <Button
                          danger
                          key="submit"
                          display="primary"
                          loading={cancelling}
                        >
                          Cancel subscription
                        </Button>
                      </Dialog.Footer>
                    </Form.Root>
                  </Dialog.Content>
                </Dialog.Dialog>
              </>
            )}
          </Flex>
        </div>
      </Flex>
    </Card>
  );
};

export const SettingsBilling: React.FC<{
  org: ApiOrg;
  params: RouteOrg;
}> = ({ org }) => {
  const getSub = useGetSubscription({ org_id: org.id });
  const [sub, setSub] = useState<GetSubscription['Success']['data'] | null>(
    null
  );

  useEffect(() => {
    if (!getSub.data) {
      return;
    }
    setSub(getSub.data.data);
  }, [getSub.data]);

  const currentPlan = useMemo(() => {
    if (!sub) {
      return undefined;
    }

    return plans.find((p) => p.price.key === sub.price.key);
  }, [sub]);

  if (getSub.isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Helmet title={`Billing - ${org.name} ${titleSuffix}`} />
      <div>
        <h2>Billing</h2>

        <Subdued>Manage your organization billing</Subdued>
      </div>

      <Usage sub={sub} orgId={org.id} currentPlan={currentPlan} />

      <Flex gap="xl" align="flex-start">
        {plans.map((plan) => {
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              orgId={org.id}
              currentPlan={currentPlan}
            />
          );
        })}
      </Flex>

      <Card padded large>
        <Flex justify="space-between">
          <h3>Need more?</h3>
          <Button display="primary">Contact us</Button>
        </Flex>
      </Card>
    </>
  );
};
