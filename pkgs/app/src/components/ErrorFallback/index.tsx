import { Flex } from '../Flex';

export const ErrorFallback: React.FC = () => {
  return (
    <Flex align="center" justify="center" style={{ height: '100vh' }}>
      An error occured. Please refresh your page or contact us,
      support@specfy.io
    </Flex>
  );
};
