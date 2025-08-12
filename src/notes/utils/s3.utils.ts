export function extractS3KeysFromContent(content: string): string[] {
  const regex = /"s3:\/\/([^"]+)"/g; // match s3://<key> used in editor src or data
  const keys: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    keys.push(decodeURIComponent(match[1]));
  }

  return keys;
}
