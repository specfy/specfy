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

import { BASE_URL } from '../env';

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
                  src={`${BASE_URL}/logo.png`}
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-home-plus"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="#787878"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M19 12h2l-9 -9l-9 9h2v7a2 2 0 0 0 2 2h5.5"></path>
                        <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2"></path>
                        <path d="M16 19h6"></path>
                        <path d="M19 16v6"></path>
                      </svg>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-news"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="#787878"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11"></path>
                        <path d="M8 8l4 0"></path>
                        <path d="M8 12l4 0"></path>
                        <path d="M8 16l4 0"></path>
                      </svg>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-brand-discord"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="#787878"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M8 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
                        <path d="M14 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
                        <path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-.972 1.923a11.913 11.913 0 0 0 -4.053 0l-.975 -1.923c-1.5 .16 -3.043 .485 -4.5 1.5c-2 5.667 -2.167 9.833 -1.5 11.5c.667 1.333 2 3 3.5 3c.5 0 2 -2 2 -3"></path>
                        <path d="M7 16.5c3.5 1 6.5 1 10 0"></path>
                      </svg>
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
