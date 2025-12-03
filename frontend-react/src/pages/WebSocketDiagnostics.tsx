import { useState } from 'react';

interface DiagnosticResult {
  timestamp: string;
  wsUrl: string;
  protocol: string;
  hostname: string;
  requestHeaders: Record<string, string>;
  responseStatus: string;
  responseHeaders: Record<string, string>;
  connectionState: string;
  errorMessage: string;
  backendHealth: any;
  backendWebSocketDiagnostics: any;
  backendWebSocketInfo: any;
}

export default function WebSocketDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testWebSocketConnection = async () => {
    setLoading(true);
    setLogs([]);
    addLog('Starting WebSocket diagnostics...');

    try {
      // Get backend health info
      addLog('Fetching backend health info...');
      const healthResponse = await fetch('https://www.bahar.co.il/fantasybroker-api/api/health');
      const healthData = await healthResponse.json();
      addLog(`Backend health: ${JSON.stringify(healthData)}`);

      // Get WebSocket diagnostics from backend
      addLog('Fetching WebSocket diagnostics from backend...');
      const wsDiagResponse = await fetch('https://www.bahar.co.il/fantasybroker-api/api/ws-diagnostics');
      const wsDiagData = await wsDiagResponse.json();
      addLog(`WebSocket diagnostics: ${JSON.stringify(wsDiagData)}`);

      // Prepare WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostname = window.location.hostname;
      const wsUrl = `${protocol}//${hostname}/fantasybroker-api/ws`;
      
      addLog(`WebSocket URL: ${wsUrl}`);
      addLog(`Protocol: ${protocol}`);
      addLog(`Hostname: ${hostname}`);

      // Create WebSocket with detailed error handling
      addLog('Attempting WebSocket connection...');
      
      const ws = new WebSocket(wsUrl);
      let connectionState = 'CONNECTING';
      let responseStatus = 'Pending';
      let errorMessage = '';

      ws.onopen = () => {
        connectionState = 'OPEN';
        responseStatus = '101 Switching Protocols';
        addLog('✅ WebSocket connected successfully!');
        
        // Send test message
        ws.send(JSON.stringify({ type: 'ping' }));
        addLog('Sent test ping message');
        
        // Close after test
        setTimeout(() => ws.close(), 1000);
      };

      ws.onmessage = (event) => {
        addLog(`Received message: ${event.data}`);
      };

      ws.onerror = (event) => {
        connectionState = 'ERROR';
        errorMessage = `WebSocket error: ${event.type}`;
        addLog(`❌ ${errorMessage}`);
      };

      ws.onclose = (event) => {
        connectionState = 'CLOSED';
        addLog(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
        
        // Set results after connection attempt
        setTimeout(() => {
          setResults({
            timestamp: new Date().toISOString(),
            wsUrl,
            protocol,
            hostname,
            requestHeaders: {
              'Connection': 'Upgrade',
              'Upgrade': 'websocket',
              'Sec-WebSocket-Version': '13',
              'Sec-WebSocket-Key': 'TUKusnvMBl97MBD6XDhb2A==',
            },
            responseStatus,
            responseHeaders: {},
            connectionState,
            errorMessage,
            backendHealth: healthData,
            backendWebSocketDiagnostics: wsDiagData,
            backendWebSocketInfo: {
              expectedPath: '/fantasybroker-api/ws',
              apiBasePath: import.meta.env.VITE_API_BASE_PATH || '/fantasybroker-api',
            },
          });
          setLoading(false);
        }, 500);
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          addLog('⏱️ Connection timeout (10 seconds)');
          ws.close();
        }
      }, 10000);

    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1e1e1e', color: '#d4d4d4', minHeight: '100vh' }}>
      <h1>🔧 WebSocket Diagnostics</h1>
      
      <button 
        onClick={testWebSocketConnection}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Testing...' : 'Test WebSocket Connection'}
      </button>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Logs */}
        <div style={{ backgroundColor: '#252526', padding: '15px', borderRadius: '4px', border: '1px solid #3e3e42' }}>
          <h2>📋 Logs</h2>
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            backgroundColor: '#1e1e1e',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            lineHeight: '1.5',
          }}>
            {logs.map((log, i) => (
              <div key={i} style={{ color: log.includes('✅') ? '#4ec9b0' : log.includes('❌') ? '#f48771' : '#d4d4d4' }}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{ backgroundColor: '#252526', padding: '15px', borderRadius: '4px', border: '1px solid #3e3e42' }}>
          <h2>📊 Results</h2>
          {results ? (
            <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
              <div><strong>Timestamp:</strong> {results.timestamp}</div>
              <div><strong>WebSocket URL:</strong> {results.wsUrl}</div>
              <div><strong>Connection State:</strong> <span style={{ color: results.connectionState === 'OPEN' ? '#4ec9b0' : '#f48771' }}>{results.connectionState}</span></div>
              <div><strong>Response Status:</strong> {results.responseStatus}</div>
              {results.errorMessage && <div style={{ color: '#f48771' }}><strong>Error:</strong> {results.errorMessage}</div>}
              <hr style={{ borderColor: '#3e3e42', margin: '10px 0' }} />
              <div><strong>Backend Health:</strong></div>
              <pre style={{ backgroundColor: '#1e1e1e', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '150px' }}>
                {JSON.stringify(results.backendHealth, null, 2)}
              </pre>
            </div>
          ) : (
            <div style={{ color: '#858585' }}>Run test to see results...</div>
          )}
        </div>
      </div>

      {/* Raw JSON */}
      {results && (
        <div style={{ marginTop: '20px', backgroundColor: '#252526', padding: '15px', borderRadius: '4px', border: '1px solid #3e3e42' }}>
          <h2>📄 Full Diagnostic Data (JSON)</h2>
          <pre style={{ 
            backgroundColor: '#1e1e1e', 
            padding: '15px', 
            borderRadius: '4px', 
            overflow: 'auto',
            maxHeight: '300px',
            fontSize: '11px',
          }}>
            {JSON.stringify(results, null, 2)}
          </pre>
          <button 
            onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

