// api/hls.js
export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Parse the target URL
    const targetUrl = decodeURIComponent(url);
    
    // Custom fetch with headers optimized for HLS streams
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'http://watchtv.best/',
        'Origin': 'http://watchtv.best',
        'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      redirect: 'follow'
    });
    
    // Handle responses with error status codes
    if (!response.ok) {
      console.error(`Error from source: Status ${response.status}`);
      
      // If we get a 4xx or 5xx error but have a response body, try to pass it along
      try {
        const errorText = await response.text();
        return res.status(response.status).send(errorText);
      } catch {
        return res.status(response.status).json({ 
          error: `Source returned status code: ${response.status}` 
        });
      }
    }
    
    // Get content type and set response headers
    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType || 'application/vnd.apple.mpegurl');
    
    // For m3u8 playlists, we may need to modify the content to rewrite URLs
    if (contentType && contentType.includes('application/vnd.apple.mpegurl')) {
      const playlistContent = await response.text();
      
      // Here you could process the m3u8 content to rewrite URLs if needed
      // For now, just pass it through
      return res.status(200).send(playlistContent);
    }
    
    // For binary content (ts segments, etc.), pass through as buffer
    const data = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(data));
  } catch (error) {
    console.error('Error proxying HLS stream:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy HLS stream', 
      message: error.message
    });
  }
}
