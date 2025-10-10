import Bun, { type BunFile } from "bun";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const MEDIA_EXTENSION = ".mkv";

export class FileExtended {
  private readonly stats: Awaited<ReturnType<Bun.BunFile["stat"]>>;

  private constructor(stats: Awaited<ReturnType<Bun.BunFile["stat"]>>) {
    this.stats = stats;
  }

  get dev(): number {
    return this.stats.dev;
  }
  get ino(): number {
    return this.stats.ino;
  }
  get size(): number {
    return this.stats.size;
  }

  async isHardLinkedWith(
    comparisonTarget: string | Bun.BunFile
  ): Promise<boolean> {
    const comparisonTargetStats =
      typeof comparisonTarget === "string"
        ? await Bun.file(comparisonTarget).stat()
        : await comparisonTarget.stat();
    return (
      this.ino === comparisonTargetStats.ino &&
      this.dev === comparisonTargetStats.dev
    );
  }

  static async fromPath(filePath: string): Promise<FileExtended> {
    const stats = await Bun.file(filePath).stat();
    return new FileExtended(stats);
  }

  static async searchMediasFromRootPath(path: string): Promise<Bun.BunFile[]> {
    const mediaFiles: BunFile[] = [];
    await searchMediasRecursively(path);

    async function searchMediasRecursively(path: string) {
      const file = Bun.file(path);
      if (await isMedia(file)) {
        mediaFiles.push(file);
      } else {
        const filesFromDir = await readdir(path);
        filesFromDir.sort();
        for (const fileFromDir of filesFromDir) {
          await searchMediasRecursively(join(path, fileFromDir));
        }
      }
    }

    async function isMedia(file: Bun.BunFile): Promise<boolean> {
      const fileStat = await file.stat();
      if (fileStat.isFile() && file.name?.endsWith(MEDIA_EXTENSION)) {
        return true;
      }
      return false;
    }

    return mediaFiles;
  }
}
