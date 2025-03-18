// api/proxy.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Get the URL parameter from the request
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Fetch the content from the source URL
    const response = await fetch(url);
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type');
    
    // Set the appropriate content type in the response
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    
    // Stream the response back to the client
    const stream = response.body;
    stream.pipe(res);
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ error: 'Failed to proxy request' });
  }
}