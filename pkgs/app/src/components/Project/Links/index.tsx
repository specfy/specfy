import type { IconType } from '@icons-pack/react-simple-icons/types';
import type { DBProjectLink } from '@specfy/models';
import { IconLink, IconPlus, IconTrash } from '@tabler/icons-react';
import classnames from 'classnames';
import { useMemo, useRef, useState } from 'react';
import { useClickAway } from 'react-use';

import { useProjectStore } from '../../../common/store';
import { supportedHostname } from '../../../common/techs';
import { useEdit } from '../../../hooks/useEdit';
import { Button } from '../../Form/Button';
import { Input } from '../../Form/Input';

import cls from './index.module.scss';

const useIcon = (link: DBProjectLink) => {
  const icon = useMemo<IconType | undefined>(() => {
    let url: URL | undefined;
    try {
      url = new URL(link.url);
    } catch {
      // empty
    }

    if (url) {
      for (const supp of supportedHostname) {
        if (supp.regHostname?.test(url.hostname)) {
          return supp.Icon;
        }
      }
    }
    return IconLink as IconType;
  }, [link.url]);

  return icon;
};

export const Link: React.FC<{ link: DBProjectLink }> = ({ link }) => {
  const Icon = useIcon(link);

  return (
    <a className={cls.link} href={link.url} target="_blank" rel="noreferrer">
      {Icon && <Icon size="1em" />} {link.title || 'Link'}
    </a>
  );
};

const LinkEdit: React.FC<{
  link: DBProjectLink;
  onChange: (link?: DBProjectLink) => void;
}> = ({ link, onChange }) => {
  const Icon = useIcon(link);

  return (
    <div className={cls.edit}>
      <Input
        value={link.title}
        size="s"
        before={Icon && <Icon size="1em" />}
        seamless
        className={cls.label}
        placeholder="Label"
        onChange={(e) => {
          onChange({ ...link, title: e.target.value });
        }}
        autoFocus
      />
      <Input
        value={link.url}
        size="s"
        placeholder="https://"
        onChange={(e) => {
          onChange({ ...link, url: e.target.value });
        }}
      />
      <div>
        <Button danger display="ghost" onClick={() => onChange()}>
          <IconTrash />
        </Button>
      </div>
    </div>
  );
};

export const ProjectLinks: React.FC = () => {
  const edit = useEdit();
  const ref = useRef(null);
  const { updateField, project } = useProjectStore();
  const [open, setOpen] = useState(false);

  const isEditing = edit.isEditing;

  useClickAway(ref, () => {
    // Remove empty link
    updateField(
      'links',
      project!.links.filter((link) => {
        return link.url;
      })
    );
    setOpen(false);
  });

  const handleClick = () => {
    if (isEditing) {
      setOpen(true);
    }
  };

  const handleChange = (pos: number, link?: DBProjectLink) => {
    if (!link) {
      // Delete
      updateField(
        'links',
        project!.links.filter((_l, i) => i !== pos)
      );
      return;
    }

    // Update
    updateField(
      'links',
      project!.links.map((l, i) => {
        if (i !== pos) return l;
        return link;
      })
    );
  };

  if (!project) {
    return null;
  }

  return (
    <div
      className={classnames(
        cls.wrapper,
        isEditing && cls.clickToEdit,
        open && cls.opened
      )}
      onClick={handleClick}
      ref={ref}
    >
      {!open && project.links.length > 0 && (
        <div className={cls.links}>
          {project.links.map((link) => {
            return <Link key={link.url} link={link} />;
          })}
        </div>
      )}
      {open && (
        <div className={cls.edits}>
          <h4>Links</h4>
          {project.links.map((link, i) => {
            return (
              <LinkEdit
                key={i}
                link={link}
                onChange={(l) => handleChange(i, l)}
              />
            );
          })}
          <Button
            size="s"
            onClick={() => {
              updateField('links', [...project.links, { title: '', url: '' }]);
            }}
          >
            <IconPlus />
            Add Link
          </Button>
        </div>
      )}
    </div>
  );
};
