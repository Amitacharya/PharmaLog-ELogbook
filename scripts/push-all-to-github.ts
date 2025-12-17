import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);

  return connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
}

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.relative(baseDir, fullPath);
    
    // Skip unwanted directories and files
    if (item === 'node_modules' || item === '.git' || item === '.replit' || 
        item === 'replit.nix' || item === '.upm' || item === '.cache' ||
        item === '.config' || item.startsWith('.breakpoints') || 
        item === '.local' || item === 'generated-icon.png' ||
        item === 'scripts') continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  const repo = 'pharmalog';
  
  console.log(`Pushing to ${owner}/${repo}...`);
  
  // First, initialize the repo with a README to make it non-empty
  console.log('Initializing repository...');
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner, repo,
      path: 'README.md',
      message: 'Initial commit',
      content: Buffer.from('# PharmaLog\n\nGMP-compliant Electronic Logbook System').toString('base64')
    });
    console.log('Repository initialized with README');
  } catch (e: any) {
    if (e.status !== 422) { // 422 means file already exists
      console.log('README already exists or error:', e.message);
    }
  }
  
  // Wait a moment for GitHub to process
  await new Promise(r => setTimeout(r, 2000));
  
  const projectDir = '/home/runner/workspace';
  const files = getAllFiles(projectDir);
  
  console.log(`Found ${files.length} files to push`);
  
  // Get latest commit SHA
  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });
  const latestCommitSha = ref.object.sha;
  
  // Get the tree SHA
  const { data: commit } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
  const baseTreeSha = commit.tree.sha;
  
  // Create blobs for all files
  const treeItems: any[] = [];
  
  for (const file of files) {
    const filePath = path.join(projectDir, file);
    const content = fs.readFileSync(filePath);
    const isBinary = file.match(/\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|bin)$/i);
    
    try {
      const { data: blob } = await octokit.git.createBlob({
        owner, repo,
        content: isBinary ? content.toString('base64') : content.toString('utf8'),
        encoding: isBinary ? 'base64' : 'utf-8'
      });
      
      treeItems.push({
        path: file,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
      console.log(`  Added: ${file}`);
    } catch (e: any) {
      console.error(`  Failed: ${file} - ${e.message}`);
    }
  }
  
  console.log(`\nCreating tree with ${treeItems.length} files...`);
  
  // Create tree
  const { data: tree } = await octokit.git.createTree({
    owner, repo,
    tree: treeItems,
    base_tree: baseTreeSha
  });
  
  // Create commit
  const { data: newCommit } = await octokit.git.createCommit({
    owner, repo,
    message: 'PharmaLog - GMP-compliant Electronic Logbook System\n\nComplete application with:\n- Equipment management\n- Activity logging with electronic signatures\n- Preventive maintenance scheduling\n- Role-based access control\n- Immutable audit trails\n- 21 CFR Part 11 compliance features',
    tree: tree.sha,
    parents: [latestCommitSha]
  });
  
  // Update main branch
  await octokit.git.updateRef({
    owner, repo,
    ref: 'heads/main',
    sha: newCommit.sha,
    force: true
  });
  
  console.log(`\n✓ Success! Code pushed to https://github.com/${owner}/${repo}`);
  console.log(`\nTo clone locally, run:`);
  console.log(`  git clone https://github.com/${owner}/${repo}.git`);
}

main().catch(console.error);
