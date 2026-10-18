const GITHUB_USERNAME_REGEX =
  /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function isValidGithubUsername(username: string): boolean {
  return GITHUB_USERNAME_REGEX.test(username);
}