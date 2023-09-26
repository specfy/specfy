import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

import type { Orgs, Users } from '@specfy/db';

import { APP_HOSTNAME } from '../env.js';

export interface InvitationProps {
  email?: string;
  userImage?: string;
  orgName?: string;
  orgImage?: string;
  orgColor?: string;
  orgAcr?: string;
  inviteLink?: string;
  invitedBy: Users;
  org: Pick<Orgs, 'acronym' | 'avatarUrl' | 'color' | 'id' | 'name'>;
}

export const Invitation = ({
  email = 'foobar@example.com',
  userImage,
  invitedBy = {
    id: '',
    avatarUrl: null,
    name: 'John Doe',
    email: 'john.doe@example.com',
    githubLogin: null,
    password: null,
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  org = {
    id: '',
    name: 'Acme',
    acronym: 'AC',
    avatarUrl: null,
    color: 'amber',
  },
  inviteLink = `${APP_HOSTNAME}/company/invite?token=`,
}: InvitationProps) => {
  const previewText = `Join ${org.name} on Specfy`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className=" mx-auto  w-[600px]">
            <Container className="border border-solid border-[#eaeaea] rounded my-[40px] p-[32px]">
              <Section className="mt-[12px]">
                <Img
                  src={`${APP_HOSTNAME}/logo.png`}
                  width="40"
                  height="40"
                  alt="Specfy"
                  className="my-0 mx-auto"
                />
              </Section>
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Join <strong>{org.name}</strong> on <strong>Specfy</strong>
              </Heading>
              <Text className="text-black text-[14px] leading-[24px]">
                Hello,
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                <strong>{invitedBy.name}</strong> (
                <Link
                  href={`mailto:${invitedBy.email}`}
                  className="text-blue-600 no-underline"
                >
                  {invitedBy.email}
                </Link>
                ) has invited you to the <strong>{org.name}</strong> org on{' '}
                <strong>Specfy</strong>.
              </Text>
              <Section>
                <Row>
                  <Column align="right">
                    {userImage ? (
                      <Img
                        className="rounded-full"
                        src={userImage}
                        width="64"
                        height="64"
                      />
                    ) : (
                      <div
                        className={`rounded-full w-[64px] h-[64px] bg-[#e9e8ea] text-center leading-[64px] text-[#1a1523]`}
                      >
                        You
                      </div>
                    )}
                  </Column>
                  <Column align="center">
                    <Img
                      src={`${APP_HOSTNAME}/arrow-right.png`}
                      width="14"
                      height="14"
                      alt="invited you to"
                    />
                  </Column>
                  <Column align="left">
                    {org.avatarUrl ? (
                      <Img
                        className="rounded-4"
                        src={org.avatarUrl}
                        width="64"
                        height="64"
                      />
                    ) : (
                      <div
                        className={`rounded-[8px] w-[64px] h-[64px] bg-[#b4dfc4] text-center leading-[64px] text-[#18794e]`}
                      >
                        {org.acronym}
                      </div>
                    )}
                  </Column>
                </Row>
              </Section>
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  pX={20}
                  pY={12}
                  className="bg-[#242d3c] rounded text-white text-[12px] font-semibold no-underline text-center"
                  href={inviteLink}
                >
                  Join the org
                </Button>
              </Section>
              <Text className="text-black text-[14px] leading-[24px]">
                Or copy and paste this URL into your browser:{' '}
                <Link href={inviteLink} className="text-blue-600 no-underline">
                  {inviteLink}
                </Link>
              </Text>
            </Container>
            <Text className="text-[#666666] text-[12px] leading-[24px] px-[12px]">
              This invitation was intended for{' '}
              <span className="text-black">{email} </span>. If you were not
              expecting this invitation, you can ignore this email. If you are
              concerned about your account&apos;s safety, please reply to this
              email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Invitation;
