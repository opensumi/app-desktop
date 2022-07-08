const semver = require('semver')
const stripHtmlComments = require('strip-html-comments')

const { cmd, isLink, encodeHTML, replaceText, getGitVersion } = require('./utils')

const COMMIT_SEPARATOR = '__AUTO_CHANGELOG_COMMIT_SEPARATOR__'
const MESSAGE_SEPARATOR = '__AUTO_CHANGELOG_MESSAGE_SEPARATOR__'
const MATCH_COMMIT = /(.*)\n(?:\s\((.*)\))?\n(.*)\n(.*)\n(.*)\n([\S\s]+)/
const MATCH_STATS = /(\d+) files? changed(?:, (\d+) insertions?...)?(?:, (\d+) deletions?...)?/
const BODY_FORMAT = '%B'
const FALLBACK_BODY_FORMAT = '%s%n%n%b'

// https://help.github.com/articles/closing-issues-via-commit-messages
const DEFAULT_FIX_PATTERN = /(?:close[sd]?|fixe?[sd]?|resolve[sd]?)\s(?:#(\d+)|(https?:\/\/.+?\/(?:issues|pull|pull-requests|merge_requests)\/(\d+)))/gi

const MERGE_PATTERNS = [
  /Merge branch .+ into .+\n\n(.+)[\S\s]+See merge request [^!]*!(\d+)/, // gitlab merge
  /Merge branch .+ into .+(.+)[\S\s]+See merge request [^!]*!(\d+)/, // gitlab.inc merge
]

exports.fetchCommits = async function fetchCommits (remote, options, branch = null, onProgress) {
  const command = branch ? `git log ${branch}` : 'git log'
  const format = await getLogFormat()
  const log = await cmd(`${command} --shortstat --pretty=format:${format} ${options.appendGitLog}`, onProgress)
  return parseCommits(log, remote, options)
}

async function getLogFormat () {
  const gitVersion = await getGitVersion()
  const bodyFormat = gitVersion && semver.gte(gitVersion, '1.7.2') ? BODY_FORMAT : FALLBACK_BODY_FORMAT
  return `${COMMIT_SEPARATOR}%H%n%d%n%ai%n%an%n%ae%n${bodyFormat}${MESSAGE_SEPARATOR}`
}

function parseCommits (string, remote, options = {}) {
  const commits = string
    .split(COMMIT_SEPARATOR)
    .slice(1)
    .map(commit => parseCommit(commit, remote, options))

  if (options.startingCommit) {
    const index = commits.findIndex(c => c.hash.indexOf(options.startingCommit) === 0)
    if (index === -1) {
      throw new Error(`Starting commit ${options.startingCommit} was not found`)
    }
    return commits.slice(0, index + 1)
  }

  return commits
}

function parseCommit (commit, remote, options = {}) {
  const [, hash, refs, date, author, email, tail] = commit.match(MATCH_COMMIT)
  const [body, stats] = tail.split(MESSAGE_SEPARATOR)
  // 需要去掉 html 格式的评论
  const message = encodeHTML(stripHtmlComments(body))
  const parsed = {
    hash,
    shorthash: hash.slice(0, 7),
    author,
    email,
    date: new Date(date).toISOString(),
    tag: getTag(refs, options),
    subject: replaceText(getSubject(message), options),
    message: message.trim(),
    fixes: getFixes(message, author, remote, options),
    href: remote.getCommitLink(hash),
    breaking: !!options.breakingPattern && new RegExp(options.breakingPattern).test(message),
    ...getStats(stats.trim())
  }

  const merge = getMerge(parsed, message, remote, options);
  if (merge) {
    console.log(merge, 'merge')
  }

  return {
    ...parsed,
    merge,
  }
}

function getTag (refs, options) {
  if (!refs) return null
  for (const ref of refs.split(', ')) {
    const prefix = `tag: ${options.tagPrefix}`
    if (ref.indexOf(prefix) === 0) {
      const tag = ref.replace(prefix, '')
      if (options.tagPattern) {
        if (new RegExp(options.tagPattern).test(tag)) {
          return tag
        }
        return null
      }
      if (semver.valid(tag)) {
        return tag
      }
    }
  }
  return null
}

function getSubject (message) {
  if (!message) {
    return '_No commit message_'
  }
  return message.match(/[^\n]+/)[0]
}

function getStats (stats) {
  if (!stats) return {}
  const [, files, insertions, deletions] = stats.match(MATCH_STATS)
  return {
    files: parseInt(files || 0),
    insertions: parseInt(insertions || 0),
    deletions: parseInt(deletions || 0)
  }
}

function getFixes (message, author, remote, options = {}) {
  const pattern = getFixPattern(options)
  const fixes = []
  let match = pattern.exec(message)
  if (!match) return null
  while (match) {
    const id = getFixID(match)
    const href = isLink(match[2]) ? match[2] : remote.getIssueLink(id)
    fixes.push({ id, href, author })
    match = pattern.exec(message)
  }
  return fixes
}

function getFixID (match) {
  // Get the last non-falsey value in the match array
  for (let i = match.length; i >= 0; i--) {
    if (match[i]) {
      return match[i]
    }
  }
}

function getFixPattern (options) {
  if (options.issuePattern) {
    return new RegExp(options.issuePattern, 'g')
  }
  return DEFAULT_FIX_PATTERN
}

function getMergePatterns (options) {
  if (options.mergePattern) {
    return MERGE_PATTERNS.concat(new RegExp(options.mergePattern, 'g'))
  }
  return MERGE_PATTERNS
}

function getMerge (commit, message, remote, options = {}) {
  const patterns = getMergePatterns(options)
  for (const pattern of patterns) {
    const match = pattern.exec(message)
    if (match) {
      const id = /^\d+$/.test(match[1]) ? match[1] : match[2]
      let commitMsg = /^\d+$/.test(match[1]) ? match[2] : match[1]
      commitMsg = commitMsg.trim()

      // changelog || message
      return {
        id,
        message: replaceText(commitMsg, options),
        href: remote.getMergeLink(id),
        author: commit.author,
        type: getType(message),
        changelog: getChangelog(message),
        commit,
      }
    }
  }
  return null
}

function getType(message) {
  const match = /\[x\](.+)/.exec(message)
  return match && match[1] && match[1].trim()
}

function getChangelog(message) {
  const stripedMsg = message.replace(/\r?\n|\r/g, '')
  const match = /### changelog(.+)See merge request [^!]*!\d+/.exec(stripedMsg)
  return match && match[1] && match[1] && cleanupUselessContent(match[1])
}

function cleanupUselessContent(msg) {
  return msg.replace(/(feat|fix|chore|refactor):?/g, '').trim();
}
