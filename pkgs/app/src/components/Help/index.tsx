import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons';
import { IconHelp, IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { Flex } from '../Flex';
import { Button } from '../Form/Button';
import * as Popover from '../Popover';
import { Subdued } from '../Text';

import cls from './index.module.scss';

export const Help: React.FC = () => {
  return (
    <Popover.Popover>
      <Popover.Trigger asChild>
        <Button size="s">
          <IconHelp />
        </Button>
      </Popover.Trigger>
      <Popover.Content className={cls.popover}>
        <h3>Need help?</h3>
        <p className={cls.desc}>
          <Subdued>
            For issues with your Specfy installation or other inquiries
          </Subdued>
        </p>

        <Flex gap="l">
          <Link to="mailto:support@specfy.io">
            <Button size="s">
              <IconMail />
              Contact support
            </Button>
          </Link>
          <div>support@specfy.io</div>
        </Flex>
        <br />

        <div>
          <h4>Reach out to the community</h4>
          <p className={cls.desc}>
            <Subdued>
              For other support, including bug report, advice, or best
              practices.
            </Subdued>
          </p>
          <Flex gap="l">
            <Link to="https://github.com/specfy/specfy" target="_blank">
              <Button size="s">
                <SiGithub size="1em" /> Check our GitHub
              </Button>
            </Link>
            <Link to="https://discord.gg/96cDXvT8NV" target="_blank">
              <Button size="s">
                <SiDiscord size="1em" /> Join our Discord
              </Button>
            </Link>
          </Flex>
        </div>
      </Popover.Content>
    </Popover.Popover>
  );
};
