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

import { BASE_URL } from '../src/env';

interface InvitationProps {
  email?: string;
  userImage?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  orgName?: string;
  orgImage?: string;
  orgColor?: string;
  orgAcr?: string;
  inviteLink?: string;
}

export const Invitation = ({
  email = 'foobar@example.com',
  userImage,
  invitedByUsername = 'John Doe',
  invitedByEmail = 'john.doe@example.com',
  orgName = 'Company',
  orgImage,
  orgColor = '5bb98c',
  orgAcr = 'SB',
  inviteLink = `${BASE_URL}/company/invite?token=`,
}: InvitationProps) => {
  const previewText = `Join ${orgName} on Specfy`;

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
                  src={`${BASE_URL}/public/logo.png`}
                  width="40"
                  height="40"
                  alt="Specfy"
                  className="my-0 mx-auto"
                />
              </Section>
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Join <strong>{orgName}</strong> on <strong>Specfy</strong>
              </Heading>
              <Text className="text-black text-[14px] leading-[24px]">
                Hello,
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                <strong>{invitedByUsername}</strong> (
                <Link
                  href={`mailto:${invitedByEmail}`}
                  className="text-blue-600 no-underline"
                >
                  {invitedByEmail}
                </Link>
                ) has invited you to the <strong>{orgName}</strong> org on{' '}
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
                        className={`rounded-full w-[64px] h-[64px] bg-[#e9e8ea] flex items-center justify-center text-[#1a1523]`}
                      >
                        You
                      </div>
                    )}
                  </Column>
                  <Column align="center">
                    <Img
                      src={`${BASE_URL}/public/arrow-right.png`}
                      width="14"
                      height="14"
                      alt="invited you to"
                    />
                  </Column>
                  <Column align="left">
                    {orgImage ? (
                      <Img
                        className="rounded-full"
                        src={orgImage}
                        width="64"
                        height="64"
                      />
                    ) : (
                      <div
                        className={`rounded-[8px] w-[64px] h-[64px] bg-[#${orgColor}] flex items-center justify-center text-white`}
                      >
                        {orgAcr}
                      </div>
                    )}
                  </Column>
                </Row>
              </Section>
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  pX={20}
                  pY={12}
                  className="bg-[#3e63dd] rounded text-white text-[12px] font-semibold no-underline text-center"
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
