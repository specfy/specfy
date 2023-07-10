import type { Metadata } from 'next';
import type { AppProps } from 'next/app';

import Layout from '@/components/Layout';
import '../globals.scss';

export const metadata: Metadata = {
  title: 'Specfy - Automatic infrastructure documentation',
  description: '',
};

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
