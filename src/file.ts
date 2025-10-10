import Bun, { type BunFile } from "bun";
import { readdir } from "node:fs/promises";
import { type Stats } from "node:fs";
import { join } from "node:path";

const MEDIA_EXTENSION = ".mkv";

export class FileMedia {
  readonly file: BunFile;
  readonly stats: Stats;

  private constructor(file: BunFile, stats: Stats) {
    this.file = file;
    this.stats = stats;
  }

  static async from(pathOrBunFile: string | Bun.BunFile): Promise<FileMedia> {
    const file =
      typeof pathOrBunFile === "string"
        ? Bun.file(pathOrBunFile)
        : pathOrBunFile;
    const stats = await file.stat();
    return new FileMedia(file, stats);
  }

  static async collectMediaFiles(rootPath: string): Promise<FileMedia[]> {
    const fileMedias: FileMedia[] = [];
    await searchMediasRecursively(rootPath);

    async function searchMediasRecursively(path: string) {
      const fileMedia = await FileMedia.from(path);
      if (await isMedia(fileMedia)) {
        fileMedias.push(fileMedia);
      } else {
        const filesFromDir = await readdir(path);
        filesFromDir.sort(); // Here to have predictive test
        for (const fileFromDir of filesFromDir) {
          await searchMediasRecursively(join(path, fileFromDir));
        }
      }
    }

    async function isMedia(fileMedia: FileMedia): Promise<boolean> {
      if (
        fileMedia.stats.isFile() &&
        fileMedia.file.name?.endsWith(MEDIA_EXTENSION)
      ) {
        return true;
      }
      return false;
    }

    return fileMedias;
  }

  async isHardLinkedWith(target: string | Bun.BunFile): Promise<boolean> {
    const targetStats =
      typeof target === "string"
        ? await Bun.file(target).stat()
        : await target.stat();
    return isHardLinked(this.stats, targetStats);

    function isHardLinked(source: Stats, target: Stats): boolean {
      return (
        source.ino === target.ino && // Same inode
        source.dev === target.dev // Same device
      );
    }
  }
}
