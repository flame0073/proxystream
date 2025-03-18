// api/proxy.js
export default async function handler(req, res) {
  // Get the URL parameter from the request
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    // Fetch the content from the source URL
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Source returned status code: ${response.status}` 
      });
    }
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type');
    
    // Set the appropriate content type in the response
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    
    // Get the response as an array buffer
    const data = await response.arrayBuffer();
    
    // Send the data back to the client
    res.status(200).send(Buffer.from(data));
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ error: 'Failed to proxy request', message: error.message });
  }
}
