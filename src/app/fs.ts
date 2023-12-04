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