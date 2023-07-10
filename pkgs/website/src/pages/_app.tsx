import type { AppProps } from 'next/app';
import Head from 'next/head';

import Layout from '@/components/Layout';

import '../globals.scss';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <title key="title">
          Specfy - Automatic infrastructure documentation
        </title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://app.specfy.io/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://app.specfy.io/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="https://app.specfy.io/favicon-16x16.png"
        />
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}
