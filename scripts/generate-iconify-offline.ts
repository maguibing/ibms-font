import { existsSync, readdirSync } from 'node:fs';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { IconifyIcon, IconifyJSON } from '@iconify/types';

type IconifyAlias = Partial<IconifyIcon> & {
  parent: string;
};

type IconifyCollection = IconifyJSON & {
  aliases?: Record<string, IconifyAlias>;
};

type IconUsageMap = Map<string, Set<string>>;

const cwd = process.cwd();
const srcDir = path.join(cwd, 'src');
const iconJsonDir = path.join(cwd, 'node_modules/@iconify/json/json');
const outputFile = path.join(srcDir, 'plugins/iconify-offline-icons.ts');
const sourceFileExtensions = new Set(['.ts', '.tsx', '.vue', '.js', '.jsx']);
const iconPattern = /(?:[`'"]|=)([a-z][a-z0-9-]*):([a-z0-9][a-z0-9:_-]*)(?=[`'"\s]|$)/g;
const menuIconCollection = 'lucide';
const defaultMenuIconName = 'menu';

/**
 * 收集需要扫描的源码文件。
 *
 * @param dir 当前目录
 * @param files 已收集的文件列表
 * @returns 源码文件路径列表
 */
async function collectSourceFiles(dir: string, files: string[] = []) {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await collectSourceFiles(filePath, files);
      continue;
    }

    if (filePath === outputFile || !sourceFileExtensions.has(path.extname(entry.name))) {
      continue;
    }

    files.push(filePath);
  }

  return files;
}

/**
 * 收集环境配置文件。
 *
 * @returns .env 文件路径列表
 */
function collectEnvFiles() {
  return readdirSync(cwd)
    .filter(file => file.startsWith('.env'))
    .map(file => path.join(cwd, file));
}

/**
 * 扫描项目中静态声明的 Iconify 图标。
 *
 * @returns 按图标集分组的图标名称
 */
async function collectIconUsage() {
  const usage: IconUsageMap = new Map();
  const files = [...(await collectSourceFiles(srcDir)), ...collectEnvFiles()];

  for (const file of files) {
    const content = await readFile(file, 'utf8');

    for (const match of content.matchAll(iconPattern)) {
      const [, prefix, name] = match;
      const iconFile = path.join(iconJsonDir, `${prefix}.json`);

      if (!existsSync(iconFile)) {
        continue;
      }

      if (!usage.has(prefix)) {
        usage.set(prefix, new Set());
      }

      usage.get(prefix)?.add(name);
    }
  }

  return usage;
}

/**
 * 读取 Iconify 图标集。
 *
 * @param prefix 图标集前缀
 * @returns 图标集数据
 */
async function readCollection(prefix: string) {
  const content = await readFile(path.join(iconJsonDir, `${prefix}.json`), 'utf8');
  return JSON.parse(content) as IconifyCollection;
}

/**
 * 提取图标，别名会递归补齐父图标。
 *
 * @param collection 图标集数据
 * @param name 图标名称
 * @param icons 已提取的图标
 * @param aliases 已提取的别名
 * @returns 是否提取成功
 */
function pickIcon(
  collection: IconifyCollection,
  name: string,
  icons: Record<string, IconifyIcon>,
  aliases: Record<string, IconifyAlias>
) {
  if (icons[name] || aliases[name]) {
    return true;
  }

  const icon = collection.icons[name];
  if (icon) {
    icons[name] = icon;
    return true;
  }

  const alias = collection.aliases?.[name];
  if (alias) {
    aliases[name] = alias;
    return pickIcon(collection, alias.parent, icons, aliases);
  }

  return false;
}

/**
 * 按 key 排序对象，保证生成文件稳定。
 *
 * @param record 待排序对象
 * @returns 排序后的对象
 */
function sortRecord<T>(record: Record<string, T>) {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b))) as Record<string, T>;
}

/**
 * 按使用情况生成离线图标子集。
 *
 * @param usage 项目中使用到的图标
 * @returns 子集图标集和缺失图标
 */
async function createSubsetCollections(usage: IconUsageMap) {
  const collections: IconifyJSON[] = [];
  const missingIcons: string[] = [];

  for (const [prefix, names] of [...usage.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const collection = await readCollection(prefix);
    const icons: Record<string, IconifyIcon> = {};
    const aliases: Record<string, IconifyAlias> = {};

    for (const name of [...names].sort()) {
      if (!pickIcon(collection, name, icons, aliases)) {
        missingIcons.push(`${prefix}:${name}`);
      }
    }

    if (!Object.keys(icons).length) {
      continue;
    }

    const subset: IconifyJSON = {
      prefix: collection.prefix,
      icons: sortRecord(icons)
    };

    if (collection.width) {
      subset.width = collection.width;
    }

    if (collection.height) {
      subset.height = collection.height;
    }

    if (Object.keys(aliases).length) {
      subset.aliases = sortRecord(aliases);
    }

    collections.push(subset);
  }

  return { collections, missingIcons };
}

/**
 * 生成菜单可选图标集。
 *
 * @returns 菜单图标集和图标名称
 */
async function createMenuIconCollection() {
  const collection = await readCollection(menuIconCollection);
  const names = Object.keys(collection.icons).sort();

  const subset: IconifyJSON = {
    prefix: collection.prefix,
    icons: sortRecord(collection.icons)
  };

  if (collection.width) {
    subset.width = collection.width;
  }

  if (collection.height) {
    subset.height = collection.height;
  }

  if (collection.aliases && Object.keys(collection.aliases).length) {
    subset.aliases = sortRecord(collection.aliases);
  }

  return { collection: subset, names };
}

/**
 * 合并菜单图标集，避免和按需扫描结果重复。
 *
 * @param collections 离线图标集
 * @param menuCollection 菜单图标集
 * @returns 合并后的图标集
 */
function mergeMenuIconCollection(collections: IconifyJSON[], menuCollection: IconifyJSON) {
  return [...collections.filter(collection => collection.prefix !== menuCollection.prefix), menuCollection].sort(
    (a, b) => a.prefix.localeCompare(b.prefix)
  );
}

/**
 * 写入离线图标文件。
 *
 * @param collections 离线图标子集
 * @param menuIconNames 菜单图标名称
 */
async function writeOutput(collections: IconifyJSON[], menuIconNames: string[]) {
  const content = `// Generated by \`pnpm gen:icons\`. Do not edit manually.
import type { IconifyJSON } from '@iconify/types';

export const menuIconCollection = '${menuIconCollection}';
export const defaultMenuIcon = '${menuIconCollection}:${defaultMenuIconName}';
export const menuIconNames = ${JSON.stringify(menuIconNames, null, 2)};

export const offlineIconCollections: IconifyJSON[] = ${JSON.stringify(collections, null, 2)};
`;

  await writeFile(outputFile, content);
}

/** 执行离线图标生成流程。 */
async function main() {
  const usage = await collectIconUsage();
  const { collections, missingIcons } = await createSubsetCollections(usage);
  const { collection: menuCollection, names: menuIconNames } = await createMenuIconCollection();
  const offlineCollections = mergeMenuIconCollection(collections, menuCollection);

  await writeOutput(offlineCollections, menuIconNames);

  const { size } = await stat(outputFile);
  const iconCount = offlineCollections.reduce((total, collection) => total + Object.keys(collection.icons).length, 0);
  const aliasCount = offlineCollections.reduce(
    (total, collection) => total + Object.keys(collection.aliases || {}).length,
    0
  );

  console.log(`Generated ${path.relative(cwd, outputFile)}`);
  console.log(
    `Collections: ${offlineCollections.length}, icons: ${iconCount}, aliases: ${aliasCount}, size: ${Math.round(size / 1024)}KB`
  );

  if (missingIcons.length) {
    console.warn(`Missing icons skipped: ${missingIcons.join(', ')}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
