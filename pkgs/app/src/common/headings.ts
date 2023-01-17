export function getHeadingID(title: string): string {
  return title.replace(/[^a-zA-Z]/g, '').toLocaleLowerCase();
}
