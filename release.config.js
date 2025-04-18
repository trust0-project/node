export default{
    branches: [
      {
        name: "main"
      },
      {
        name: "develop",
        prerelease: "rc",
        channel: "rc"
      },
      "v+([0-9])?(.{+([0-9]),x}).x"
    ],
    plugins: [
      ['@semantic-release/commit-analyzer', { preset: "conventionalcommits" }],
      ['@semantic-release/release-notes-generator', { preset: "conventionalcommits" }],
      ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
      ['@semantic-release/exec', { "prepareCmd": 'npm version ${nextRelease.version} --git-tag-version false'}],
      ['@semantic-release/exec', { "prepareCmd": 'npm run build'}],
      ['@semantic-release/exec', { "prepareCmd": 'npm publish --access public'}],
      [
        '@semantic-release/git',
        {
          assets: [
            'package.json',
            'package-lock.json',
            'CHANGELOG.md',
            'docs/**/*',
          ],
          message: 'chore(release): release ${nextRelease.version}\n\n${nextRelease.notes}',
        },
      ],
    ],
  };
  