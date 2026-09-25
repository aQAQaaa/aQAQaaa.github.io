/**
 * 歌单同步脚本 / Playlist Sync Script (带 VIP/外链可用性智能检测)
 * 运行方式: node sync-playlist.js [歌单ID]
 * 默认使用当前歌单: 14317721939
 */
const https = require('https');
const http = require('http');
const fs = require('fs');

const playlistId = process.argv[2] || '14317721939';
console.log(`正在从网易云同步歌单 [${playlistId}]...`);

function checkPlayable(url) {
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode === 302 && res.headers.location) {
        const loc = res.headers.location;
        const client = loc.startsWith('https') ? https : http;
        client.request(loc, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, res2 => {
          const len = parseInt(res2.headers['content-length'] || '0', 10);
          resolve(res2.statusCode === 200 && len > 50000);
        }).on('error', () => resolve(false)).end();
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.setTimeout(4000, () => { req.destroy(); resolve(false); });
    req.end();
  });
}

https.get(`https://music.163.com/api/v1/playlist/detail?id=${playlistId}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (!json.playlist) {
        console.error('获取歌单失败，请检查歌单ID或网络连接。');
        return;
      }
      const p = json.playlist;
      const trackIds = p.trackIds.map(t => t.id);
      console.log(`歌单名称: "${p.name}", 原始歌曲共 ${trackIds.length} 首。正在拉取元数据并检测外链可用性...`);

      const songDetailUrl = `https://music.163.com/api/song/detail?ids=[${trackIds.join(',')}]`;
      https.get(songDetailUrl, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', async () => {
          const j2 = JSON.parse(data2);
          const rawSongs = j2.songs.map(t => ({
            id: t.id,
            title: t.name,
            artist: t.artists ? t.artists.map(a => a.name).join(' / ') : (t.ar ? t.ar.map(a => a.name).join(' / ') : '未知歌手'),
            album: t.album ? t.album.name : (t.al ? t.al.name : ''),
            cover: (t.album && t.album.picUrl) ? t.album.picUrl.replace('http://', 'https://') : ((t.al && t.al.picUrl) ? t.al.picUrl.replace('http://', 'https://') : ''),
            url: `https://music.163.com/song/media/outer/url?id=${t.id}.mp3`
          }));

          const verified = [];
          for (let i = 0; i < rawSongs.length; i++) {
            const s = rawSongs[i];
            const ok = await checkPlayable(s.url);
            if (ok) {
              verified.push(s);
              console.log(`[${i+1}/${rawSongs.length}] ✅ 可播: ${s.title} - ${s.artist}`);
            } else {
              console.log(`[${i+1}/${rawSongs.length}] ❌ VIP/受限(自动剔除): ${s.title}`);
            }
          }

          const out = `/**\n * Daily Music Playlist Data - Verified 100% Playable Tracks from NetEase Playlist\n * Playlist ID: ${playlistId}\n * Playable Count: ${verified.length}\n */\nwindow.BLOG_PLAYLIST_DATA = ${JSON.stringify({
            playlistId: playlistId,
            playlistName: p.name || '我的私房歌',
            songs: verified
          }, null, 2)};\n`;

          fs.writeFileSync('js/daily-music-data.js', out, 'utf8');
          console.log(`\n🎉 同步完成！已过滤 VIP 受限歌曲，共保存 ${verified.length} 首 100% 可播放歌曲到 js/daily-music-data.js。`);
        });
      });
    } catch(err) {
      console.error('解析歌单数据出错:', err);
    }
  });
}).on('error', err => console.error('网络请求失败:', err));
