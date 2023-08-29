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

import { APP_HOSTNAME } from '../env.js';

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
                  src={`${APP_HOSTNAME}/logo.png`}
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
                <Link href={`${APP_HOSTNAME}/organizations/new`}>
                  <Row className="border border-solid border-[#eaeaea] rounded-md">
                    <Column className="border-solid border-[#fff] border-8 bg-[#fafafa] rounded-md text-center w-[80px] h-[60px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-home-plus"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="#222"
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
                      <Text className="text-[14px] leading-[12px] px-5 my-2 text-[#6f6e77]">
                        Get started right now
                      </Text>
                    </Column>
                  </Row>
                </Link>
              </Section>
              <Section className="mt-[12px] mb-[24px] border">
                <Link href="https://github.com/specfy/specfy">
                  <Row className="border border-solid border-[#eaeaea] rounded-md">
                    <Column className="border-solid border-[#fff] border-8 bg-[#fafafa] rounded-md text-center w-[80px] h-[60px]">
                      <svg
                        role="img"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#222"
                        width="24"
                        height="24"
                      >
                        <title>GitHub</title>
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                    </Column>
                    <Column>
                      <Heading as="h4" className="text-[#000] px-5 my-2">
                        Check our Github
                      </Heading>
                      <Text className="text-[14px] leading-[12px] px-5 my-2 text-[#6f6e77]">
                        Read the source code, report bug, run your own.
                      </Text>
                    </Column>
                  </Row>
                </Link>
              </Section>
              <Section className="mt-[12px] border">
                <Link href="https://specfy.io/blog">
                  <Row className="border border-solid border-[#eaeaea] rounded-md">
                    <Column className="border-solid border-[#fff] border-8 bg-[#fafafa] rounded-md text-center w-[80px] h-[60px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-news"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="#222"
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
                      <Text className="text-[14px] leading-[12px] px-5 my-2 text-[#6f6e77]">
                        Our latest news and tips
                      </Text>
                    </Column>
                  </Row>
                </Link>
              </Section>
              <Section className="mt-[12px] mb-[24px] border">
                <Link href="https://discord.gg/96cDXvT8NV">
                  <Row className="border border-solid border-[#eaeaea] rounded-md">
                    <Column className="border-solid border-[#fff] border-8 bg-[#fafafa] rounded-md text-center w-[80px] h-[60px]">
                      <svg
                        role="img"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#222"
                        width="24"
                        height="24"
                      >
                        <title>Discord</title>
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                      </svg>
                    </Column>
                    <Column>
                      <Heading as="h4" className="text-[#000] px-5 my-2">
                        Join our Discord community
                      </Heading>
                      <Text className="text-[14px] leading-[12px] px-5 my-2 text-[#6f6e77]">
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
