import type { InfoTorrent } from "./torrent";

export class WatchedMedia {
  public readonly medias: Media[];

  private constructor(medias: Media[]) {
    this.medias = medias;
  }

  static addMediasLinkedToTorrent(torrents: InfoTorrent[]): WatchedMedia {
    return new WatchedMedia(torrents.map((torrent) => ({ torrent })));
  }
}

interface Media {
  readonly torrent: InfoTorrent;
}
