import type { MediaTorrent, MediaTorrents } from "./torrent";

export class WatchedMedia {
  readonly medias: Media[];

  private constructor(medias: Media[]) {
    this.medias = medias;
  }

  static addMediaTorrents(mediaTorrents: MediaTorrents): WatchedMedia {
    return new WatchedMedia(
      mediaTorrents.torrents.map((torrent) => ({ torrent }))
    );
  }
}

interface Media {
  readonly torrent: MediaTorrent;
}
