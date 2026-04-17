function getStreams() {
  return new Promise((resolve) => {

    let streams = [];

    fetch("https://banglaplex.click/")
      .then(res => res.text())
      .then(html => {

        if (!html) return resolve([]);

        let match = html.match(/https:\/\/pasteurl\.net\/view\/[^\s"]+/);

        if (!match) return resolve([]);

        return fetch(match[0]);
      })
      .then(res => res ? res.text() : null)
      .then(page => {

        if (!page) return resolve([]);

        let links = page.match(/https?:\/\/[^\s"<]+/g) || [];

        links.forEach(link => {

          if (
            link.includes("streamtape") ||
            link.includes("gdflix") ||
            link.includes("filepress")
          ) {

            let source = "BanglaPlex";

            streams.push({
              name: source,
              title: source + " - HD",
              url: link,
              quality: "HD"
            });
          }
        });

        resolve(streams.slice(0, 10));
      })
      .catch(() => resolve([]));

  });
}

module.exports = { getStreams };
