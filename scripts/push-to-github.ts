import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  const { data: user } = await octokit.users.getAuthenticated();
  console.log('GitHub Username:', user.login);
  
  const repoName = 'pharmalog';
  try {
    await octokit.repos.get({ owner: user.login, repo: repoName });
    console.log('Repository exists:', `${user.login}/${repoName}`);
  } catch (e: any) {
    if (e.status === 404) {
      console.log('Creating repository...');
      await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'PharmaLog - GMP-compliant Electronic Logbook System',
        private: false
      });
      console.log('Repository created:', `${user.login}/${repoName}`);
    } else {
      throw e;
    }
  }
  
  console.log('ACCESS_TOKEN=' + accessToken);
  console.log('REPO_URL=https://github.com/' + user.login + '/' + repoName + '.git');
  console.log('USERNAME=' + user.login);
}

main().catch(console.error);
