import { SiGithub } from '@icons-pack/react-simple-icons';

export const Footer: React.FC = () => {
  return (
    <footer className="flex-0 pt-8 pb-8 border-t border-gray-700 bg-[#242d3c]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 gap-8 text-gray-400">
        <div className="flex justify-between">
          <p className="text-sm">© 2023 Specfy, all rights reserved.</p>
          <div>
            <a
              href="https://github.com/specfy"
              target="_blank"
              title="GitHub"
              className="text-gray-200 hover:text-gray-50 focus:text-gray-50"
              rel="noreferrer"
            >
              <SiGithub />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
