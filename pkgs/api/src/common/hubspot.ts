import { Client } from '@hubspot/api-client';
import { envs, l } from '@specfy/core';

import type { GitHubAuthProfile } from '../types/github.js';
import type { SimplePublicObjectInputForCreate } from '@hubspot/api-client/lib/codegen/crm/companies';
import type { SimplePublicObject } from '@hubspot/api-client/lib/codegen/crm/contacts';

const hubspot = new Client({
  accessToken: envs.HUBSPOT_ACCESS_TOKEN || '',
  numberOfApiCallRetries: 3,
});

export async function createCRMContact({
  firstname,
  email,
  githubProfile,
}: {
  firstname: string;
  email: string;
  githubProfile: GitHubAuthProfile;
}): Promise<SimplePublicObject> {
  const contact: SimplePublicObjectInputForCreate = {
    properties: {
      firstname,
      email,
      lifecyclestage: 'customer',
      twitterusername: githubProfile.twitter_username || '',
      city: githubProfile.location || '',
      company: githubProfile.company || '',
      website: githubProfile.blog || '',
      github_repository: githubProfile.html_url || '',
      github_public_repos: githubProfile.public_repos?.toString() || '0',
      github_followers: githubProfile.followers?.toString() || '0',
    },
    associations: [],
  };

  return await hubspot.crm.contacts.basicApi.create(contact);
}

export async function subscribeToEmails(email: string) {
  try {
    await hubspot.communicationPreferences.statusApi.subscribe({
      emailAddress: email,
      legalBasis: 'LEGITIMATE_INTEREST_CLIENT',
      subscriptionId: envs.HUBSPOT_SUBSCRIPTION_MARKETING_ID!,
      legalBasisExplanation:
        'Agree to receive newsletters and other marketing interests',
    });
  } catch (error) {
    l.warn(error);
  }

  try {
    await hubspot.communicationPreferences.statusApi.subscribe({
      emailAddress: email,
      legalBasis: 'PROCESS_AND_STORE',
      subscriptionId: envs.HUBSPOT_SUBSCRIPTION_TRANSACTIONAL_ID!,
      legalBasisExplanation:
        'Agree to receive transactional emails after account creation',
    });
  } catch (error) {
    l.warn(error);
  }

  try {
    await hubspot.communicationPreferences.statusApi.subscribe({
      emailAddress: email,
      legalBasis: 'LEGITIMATE_INTEREST_OTHER',
      subscriptionId: envs.HUBSPOT_SUBSCRIPTION_SALES_ID!,
      legalBasisExplanation: 'Agree to get in touch with Specfy team',
    });
  } catch (error) {
    l.warn(error);
  }
}
