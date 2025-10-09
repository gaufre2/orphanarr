import Bun from "bun";

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
}
