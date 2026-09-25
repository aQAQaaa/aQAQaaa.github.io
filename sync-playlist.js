/**
 * 歌单同步脚本 / Playlist Sync Script
 * 运行方式: node sync-playlist.js [歌单ID]
 * 默认使用当前歌单: 14317721939
 */
const https = require('https');
const fs = require('fs');

const playlistId = process.argv[2] || '14317721939';
console.log(`正在从网易云同步歌单 [${playlistId}]...`);

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
      console.log(`歌单名称: "${p.name}", 共 ${trackIds.length} 首歌曲。正在拉取所有歌曲元数据...`);

      const songDetailUrl = `https://music.163.com/api/song/detail?ids=[${trackIds.join(',')}]`;
      https.get(songDetailUrl, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          const j2 = JSON.parse(data2);
          const songs = j2.songs.map(t => ({
            id: t.id,
            title: t.name,
            artist: t.artists ? t.artists.map(a => a.name).join(' / ') : (t.ar ? t.ar.map(a => a.name).join(' / ') : '未知歌手'),
            album: t.album ? t.album.name : (t.al ? t.al.name : ''),
            cover: (t.album && t.album.picUrl) ? t.album.picUrl.replace('http://', 'https://') : ((t.al && t.al.picUrl) ? t.al.picUrl.replace('http://', 'https://') : ''),
            url: `https://music.163.com/song/media/outer/url?id=${t.id}.mp3`
          }));

          const out = `/**\n * Daily Music Playlist Data - Automatically synchronized from NetEase Playlist\n * Playlist ID: ${playlistId}\n * Track Count: ${songs.length}\n */\nwindow.BLOG_PLAYLIST_DATA = ${JSON.stringify({
            playlistId: playlistId,
            playlistName: p.name || '我的私房歌',
            songs: songs
          }, null, 2)};\n`;

          fs.writeFileSync('js/daily-music-data.js', out, 'utf8');
          console.log(`✅ 同步完成！已更新 js/daily-music-data.js，包含全部 ${songs.length} 首歌曲。`);
        });
      });
    } catch(err) {
      console.error('解析歌单数据出错:', err);
    }
  });
}).on('error', err => console.error('网络请求失败:', err));
