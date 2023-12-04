import { nanoid } from 'nanoid';

export async function readFile(name: string) {
  const root = await navigator.storage.getDirectory();
  const handle = await root.getFileHandle(name);
  const file = await handle.getFile();
  return URL.createObjectURL(file);
}

export async function writeFile(file: File) {
  const name = nanoid();
  const root = await navigator.storage.getDirectory();
  const handle = await root.getFileHandle(name, { create: true });
  const writer = await handle.createWritable();
  await writer.write(file);
  await writer.close();
  return name;
}

function goToTable(src: string) {
  const selfUrl = new URL('/hippostats/app', location.href);
  selfUrl.searchParams.set('source', src);
  location.assign(selfUrl);
}

export async function persistSource(file: File | string) {
  if (typeof file === 'string') return goToTable(file);
  const name = await writeFile(file);
  goToTable(`fs:${name}`);
}

export async function accessSource(): Promise<string | null> {
  const source = new URLSearchParams(location.search).get('source');
  if (source?.startsWith('fs:')) {
    return(await readFile(source.replace('fs:', '')))
  } else if (source) {
    return(source);
  }
  return null
}
