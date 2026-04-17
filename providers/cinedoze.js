function getStreams() {
  return new Promise((resolve) => {

    let streams = [];

    // STEP 1: Load homepage (for testing first)
    fetch("https://cinedoze.tv/")
      .then(res => res.text())
      .then(html => {

        if (!html) return resolve([]);

        // STEP 2: find /links/ page
        let match = html.match(/https:\/\/cinedoze\.tv\/links\/[^\s"]+/);

        if (!match) return resolve([]);

        return fetch(match[0]);
      })
      .then(res => res ? res.text() : null)
      .then(page => {

        if (!page) return resolve([]);

        // STEP 3: extract host links
        let links = page.match(/https?:\/\/[^\s"<]+/g) || [];

        let hostLinks = links.filter(link =>
          link.includes("hubcloud") ||
          link.includes("gdflix") ||
          link.includes("filepress")
        );

        if (hostLinks.length === 0) return resolve([]);

        let pending = hostLinks.length;

        hostLinks.forEach(link => {

          resolveHost(link).then(video => {

            if (video) {
              streams.push({
                name: "Cinedoze",
                title: formatTitle(link),
                url: video,
                quality: detectQuality(link)
              });
            }

            pending--;
            if (pending === 0) resolve(streams);

          }).catch(() => {
            pending--;
            if (pending === 0) resolve(streams);
          });

        });

      })
      .catch(() => resolve([]));

  });
}

module.exports = { getStreams };


// ----------------------
// 🔧 RESOLVER FUNCTIONS
// ----------------------

function resolveHost(url) {
  return new Promise((resolve) => {

    fetch(url)
      .then(res => res.text())
      .then(html => {

        if (!html) return resolve(null);

        // try direct video extraction
        let video = extractVideo(html);

        if (video) return resolve(video);

        // fallback: check redirect patterns
        let redirect = html.match(/https?:\/\/[^\s"]+\.(m3u8|mp4)/);

        if (redirect) return resolve(redirect[0]);

        resolve(null);
      })
      .catch(() => resolve(null));

  });
}


// extract direct stream
function extractVideo(html) {

  // m3u8
  let m3u8 = html.match(/https?:\/\/[^\s"]+\.m3u8/);
  if (m3u8) return m3u8[0];

  // mp4
  let mp4 = html.match(/https?:\/\/[^\s"]+\.mp4/);
  if (mp4) return mp4[0];

  return null;
}


// detect quality
function detectQuality(link) {
  if (link.includes("2160")) return "4K";
  if (link.includes("1080")) return "1080p";
  if (link.includes("720")) return "720p";
  return "HD";
}


// format title
function formatTitle(link) {

  let source = "Cinedoze";

  if (link.includes("gdflix")) source = "GDFlix";
  if (link.includes("hubcloud")) source = "HubCloud";
  if (link.includes("filepress")) source = "FilePress";

  return source + " - " + detectQuality(link);
}
