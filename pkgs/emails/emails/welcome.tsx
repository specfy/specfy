import {
  Body,
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
import { IconHomePlus, IconBrandDiscord, IconNews } from '@tabler/icons-react';

import { BASE_URL } from '../src/env';

export interface WelcomeProps {
  name: string;
  email: string;
}

export const Welcome: React.FC<WelcomeProps> = ({
  name = 'John Doe',
  email = 'john.doe@example.com',
}) => {
  const previewText = `Welcome to Specfy`;

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
                Welcome to <strong>Specfy</strong>
              </Heading>
              <Text className="text-black text-[14px] leading-[24px]">
                Hello <strong>{name}</strong>,
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                We&apos;ve made it easy to extract all your metadata and
                dependencies from your organization repositories. <br />
                Wether you are onboarding new employees, starting a new project
                with an other team or just want to have an overview of your
                productions, Specfy is there to help you. We can&apos;t wait for
                you to get started.
              </Text>
              <Section className="mt-[24px] border">
                <Link href={`${BASE_URL}/organizations/new`}>
                  <Row className="border border-solid border-[#eaeaea] rounded-md">
                    <Column className="border border-solid border-[#fff] border-8 bg-[#fafafa] rounded-md text-center w-[80px] h-[60px]">
                      <IconHomePlus className="stroke-[#787878]" />
                    </Column>
                    <Column>
                      <Heading as="h4" className="text-[#000] px-5 my-2">
                        Create an organization
                      </Heading>
                      <Text className="text-black text-[14px] leading-[12px] px-5 my-2 text-[#6f6e77]">
                        Get started right now
                      </Text>
                    </Column>
                  </Row>
                </Link>
              </Section>
              <Section className="mt-[12px] border">
                <Link href="https://specfy.io/blog">
                  <Row className="border border-solid border-[#eaeaea] rounded-md">
                    <Column className="border border-solid border-[#fff] border-8 bg-[#fafafa] rounded-md text-center w-[80px] h-[60px]">
                      <IconNews className="stroke-[#787878]" />
                    </Column>
                    <Column>
                      <Heading as="h4" className="text-[#000] px-5 my-2">
                        Read our Blog
                      </Heading>
                      <Text className="text-black text-[14px] leading-[12px] px-5 my-2 text-[#6f6e77]">
                        Our latest news and tips
                      </Text>
                    </Column>
                  </Row>
                </Link>
              </Section>
              <Section className="mt-[12px] mb-[24px] border">
                <Link href="https://discord.gg/UGFVqu76Vj">
                  <Row className="border border-solid border-[#eaeaea] rounded-md">
                    <Column className="border border-solid border-[#fff] border-8 bg-[#fafafa] rounded-md text-center w-[80px] h-[60px]">
                      <IconBrandDiscord className="stroke-[#787878]" />
                    </Column>
                    <Column>
                      <Heading as="h4" className="text-[#000] px-5 my-2">
                        Join our Discord community
                      </Heading>
                      <Text className="text-black text-[14px] leading-[12px] px-5 my-2 text-[#6f6e77]">
                        Share feature requests, feedback, and chat with our team
                      </Text>
                    </Column>
                  </Row>
                </Link>
              </Section>

              <Text className="text-black text-[14px] leading-[24px]">
                Have questions or need help? Reach out anytime. We love
                collaborating with our community!
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                Best, <br></br>The Specfy Team
              </Text>
            </Container>
            <Text className="text-[#666666] text-[12px] leading-[24px] px-[12px]">
              This invitation was intended for{' '}
              <span className="text-black">{email} </span>. If you were not
              expecting this mail, you can ignore this email. If you are
              concerned about your account&apos;s safety, please reply to this
              email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Welcome;
