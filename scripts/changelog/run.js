const semver = require('semver')
const uniqBy = require('lodash.uniqby')
const groupBy = require('lodash.groupby')

const { fetchRemote } = require('./remote')
const { fetchCommits } = require('./commits')
const { parseReleases, sortReleases } = require('./releases')
const { writeFile, updateLog, formatBytes } = require('./utils')

const DEFAULT_OPTIONS = {
  output: 'releaselog.md',
  remote: 'origin',
  commitLimit: 3,
  backfillLimit: 3,
  tagPrefix: '',
  sortCommits: 'relevance',
  appendGitLog: '',
  latestVersion: ''
}

module.exports = async function run (opts) {
  const options = { ...DEFAULT_OPTIONS, ...opts }
  const log = string => options.stdout ? null : updateLog(string)
  log('Fetching remote…')
  const remote = await fetchRemote(options)
  const commitProgress = bytes => log(`Fetching commits… ${formatBytes(bytes)} loaded`)
  const commits = await fetchCommits(remote, options, null, commitProgress)

  log('Generating changelog…')
  const latestVersion = options.latestVersion // await getLatestVersion(options, commits)
  const releases = await getReleases(commits, remote, latestVersion, options)

  let latestRelease = releases[0];
  if (latestVersion) {
    const index = releases.findIndex((n) => n.tag === latestVersion);
    if (index < 0) {
      throw new Error(`latest version ${latestVersion} didn\'t not release yet`);
    }
    latestRelease = releases[index];
  }

  const changelog = await compileTemplate(latestRelease)
  // process.stdout.write(changelog)
  await writeFile(options.output, changelog)
  const bytes = Buffer.byteLength(changelog, 'utf8')
  log(`${formatBytes(bytes)} written to ${options.output}\n`)
}

// todo: skip alpha release
async function getLatestVersion (options, commits) {
  // user can pass a version here
  if (options.latestVersion) {
    if (!semver.valid(options.latestVersion)) {
      throw new Error('--latest-version must be a valid semver version')
    }
    return options.latestVersion
  }
  return null
}

async function getReleases (commits, remote, latestVersion, options) {
  let releases = parseReleases(commits, remote, latestVersion, options)
  if (options.includeBranch) {
    for (const branch of options.includeBranch) {
      const commits = await fetchCommits(remote, options, branch)
      releases = [
        ...releases,
        ...parseReleases(commits, remote, latestVersion, options)
      ]
    }
  }
  return uniqBy(releases, 'tag').sort(sortReleases)
}

function compileTemplate(data) {
  const { title, href, niceDate, merges } = data
  const mergesDesc = groupBy(merges, 'type');
  return [
    `### [${title}](${href})`,
    `> ${niceDate}`,
  ].concat(...Object.keys(mergesDesc).map((type) => {
    return [
      `#### ${type}`
    ].concat(...mergesDesc[type].map(merge => {
      console.log(data)
      return `- ${merge.changelog || merge.title} [#${merge.id}](${merge.href})`
    }))
  })).join('\n\n')
}
