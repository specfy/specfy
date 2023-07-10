import { IconBrandGithubFilled } from '@tabler/icons-react';

export const Footer: React.FC = () => {
  return (
    <footer className="flex-0 pt-8 pb-4 border-t border-gray-700 bg-[#242d3c]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 gap-8 columns-1 sm:columns-2 md:columns-4">
        <div className="pb-4 space-y-6 text-gray-400 break-inside-avoid md:break-after-column">
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/specfy"
              target="_blank"
              title="GitHub"
              className="text-gray-200 hover:text-gray-50 focus:text-gray-50"
              rel="noreferrer"
            >
              <IconBrandGithubFilled />
            </a>
          </div>
          <p className="text-sm">© 2023 Specfy, all rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
