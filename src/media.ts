import type { InfoTorrent } from "./torrent";

export class WatchedMedia {
  public readonly torrent: InfoTorrent;

  constructor(torrent: InfoTorrent) {
    this.torrent = torrent;
  }
}

export class WatchedMedias {
  public readonly medias: WatchedMedia[];

  constructor() {
    this.medias = [];
  }

  addMedia(media: WatchedMedia): void {
    this.medias.push(media);
  }

  addTorrents(torrents: InfoTorrent[]): void {
    torrents.forEach((torrent) => this.addMedia(new WatchedMedia(torrent)));
  }
}
