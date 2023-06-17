import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

import { BASE_URL } from '../src/env';

interface WelcomeProps {
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
                We are glad to have you in our community.
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
