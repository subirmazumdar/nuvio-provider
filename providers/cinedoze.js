function getStreams() {
  return new Promise((resolve) => {

    let streams = [];

    fetch("https://cinedoze.tv/")
      .then(res => res.text())
      .then(html => {

        if (!html) return resolve([]);

        let match = html.match(/https:\/\/cinedoze\.tv\/links\/[^\s"]+/);

        if (!match) return resolve([]);

        return fetch(match[0]);
      })
      .then(res => res ? res.text() : null)
      .then(page => {

        if (!page) return resolve([]);

        let links = page.match(/https?:\/\/[^\s"<]+/g) || [];

        links.forEach(link => {

          if (
            link.includes("hubcloud") ||
            link.includes("gdflix") ||
            link.includes("filepress")
          ) {

            let source = "Cinedoze";
            let quality = "HD";

            if (link.includes("2160")) quality = "4K";
            else if (link.includes("1080")) quality = "1080p";

            streams.push({
              name: source,
              title: source + " - " + quality,
              url: link,
              quality: quality
            });
          }
        });

        resolve(streams.slice(0, 10));
      })
      .catch(() => resolve([]));

  });
}

module.exports = { getStreams };
