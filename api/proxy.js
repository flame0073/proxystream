// api/proxy.js
export default async function handler(req, res) {
  // Get the URL parameter from the request
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Parse the URL to modify headers or parameters if needed
    const targetUrl = decodeURIComponent(url);
    
    // Custom fetch with modified headers to mimic a browser
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://watchtv.best/',
        'Origin': 'https://watchtv.best',
        'Connection': 'keep-alive'
      },
      redirect: 'follow',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error(`Error from source: Status ${response.status}`);
      return res.status(response.status).json({ 
        error: `Source returned status code: ${response.status}` 
      });
    }
    
    // Get all headers and forward relevant ones
    const headers = Object.fromEntries(response.headers);
    
    // Copy content type and other important headers
    if (headers['content-type']) {
      res.setHeader('Content-Type', headers['content-type']);
    }
    
    if (headers['content-disposition']) {
      res.setHeader('Content-Disposition', headers['content-disposition']);
    }
    
    if (headers['cache-control']) {
      res.setHeader('Cache-Control', headers['cache-control']);
    }
    
    // Get the response data
    const data = await response.arrayBuffer();
    
    // Send the response
    res.status(200).send(Buffer.from(data));
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ 
      error: 'Failed to proxy request', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
