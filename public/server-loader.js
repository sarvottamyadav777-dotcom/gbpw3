(function() {
  // Global function to handle class URL clicks and optional server redirects
  window.openClassUrl = function(url, serverName) {
    if (!url) return;

    // Only Study Aura (studyaura.online) triggers the loading modal.
    // Server 2 (pwlive.pages.dev / PW Backup) and internal player links do NOT show loading screen.
    const isStudyAura = url.includes('studyaura.online');
    if (!isStudyAura) {
      window.location.href = url;
      return;
    }

    // Check if redirect overlay already exists, else create it
    let overlay = document.getElementById('serverLoadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'serverLoadingOverlay';
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(10, 14, 26, 0.96);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(overlay);
    }

    const targetServerName = serverName || (url.includes('studyaura.online') ? 'Study Aura' : 'Primary Server');

    overlay.innerHTML = `
      <div style="
        width: 100%;
        max-width: 420px;
        background: #0f172a;
        border: 1px solid rgba(139, 92, 246, 0.35);
        border-radius: 24px;
        padding: 24px 20px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.25);
        color: #ffffff;
        text-align: center;
        position: relative;
        overflow: hidden;
      ">
        <!-- Top Image Banner -->
        <div style="margin-bottom: 16px; display: flex; justify-content: center; align-items: center;">
          <div style="
            background: rgba(15, 23, 42, 0.8);
            padding: 8px 12px;
            border-radius: 16px;
            border: 1px solid rgba(139, 92, 246, 0.25);
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          ">
            <img src="https://i.ibb.co/3YpmY4qx/IMG-20260924-202515-178.jpg" 
                 alt="Study Aura" 
                 style="height: 64px; max-width: 220px; object-fit: contain; border-radius: 10px;"
                 onerror="this.onerror=null; this.src='https://i.ibb.co/Q3g9fGSt/1791541921524.png';"
            />
          </div>
        </div>

        <!-- Title & Subtitle -->
        <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.3px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span style="
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 12px #10b981;
            animation: pulse 1.5s infinite;
          "></span>
          Finding best server
        </div>
        <div style="font-size: 13.5px; font-weight: 700; color: #a78bfa; margin-bottom: 18px;">
          Study Aura (${escapeHtmlServer(targetServerName)})
        </div>

        <!-- Animated Logs Terminal -->
        <div style="
          background: #030712;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 14px 16px;
          text-align: left;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11.5px;
          line-height: 1.65;
          min-height: 115px;
          margin-bottom: 20px;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.7);
        " id="serverLogsContainer">
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #6b7280;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.5px;
          ">
            <span>[SERVER CONNECT LOGS]</span>
            <span style="color: #34d399; font-size: 10px;">CONNECTING...</span>
          </div>
          <div id="logList"></div>
        </div>

        <!-- Progress Bar -->
        <div style="height: 6px; width: 100%; background: #1e293b; border-radius: 3px; overflow: hidden; margin-bottom: 20px; padding: 1px;">
          <div id="serverProgressBar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #6366f1, #a855f7, #10b981); transition: width 0.35s ease; border-radius: 3px; box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);"></div>
        </div>

        <!-- Telegram Button -->
        <a href="https://t.me/GBFreestudy" target="_blank" rel="noopener noreferrer" style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 13px 16px;
          background: linear-gradient(135deg, #0088cc, #00a0ee);
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          border-radius: 16px;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(0, 136, 204, 0.35);
          transition: all 0.2s ease;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.67-.55.83-1.12.51l-3.01-2.22-1.45 1.4c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.37-.13l-6.87 4.33-2.96-.92c-.64-.2-.65-.64.13-.95l11.57-4.46c.54-.2 1.01.13.89.93z"/>
          </svg>
          Join Telegram Channel
        </a>
      </div>
    `;

    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    // Animate Logs Step by Step
    const logList = document.getElementById('logList');
    const progressBar = document.getElementById('serverProgressBar');

    const logs = [
      { text: '⚡ Initializing network connection...', color: '#9ca3af', progress: 20 },
      { text: `🌐 Querying Study Aura server node...`, color: '#60a5fa', progress: 45 },
      { text: '🔒 Authenticating stream security tokens...', color: '#a78bfa', progress: 75 },
      { text: '🚀 Node connected! Redirecting to stream...', color: '#34d399', progress: 100 }
    ];

    let currentStep = 0;
    logList.innerHTML = '';

    function nextLog() {
      if (currentStep < logs.length) {
        const item = logs[currentStep];
        const logLine = document.createElement('div');
        logLine.style.cssText = `color: ${item.color}; margin-bottom: 5px; font-size: 11px; font-weight: 600; opacity: 0; transform: translateY(4px); transition: all 0.2s ease; display: flex; align-items: center; gap: 6px;`;
        logLine.innerHTML = `<span style="color: #4b5563;">&gt;</span> <span>${item.text}</span>`;
        logList.appendChild(logLine);
        
        requestAnimationFrame(() => {
          logLine.style.opacity = '1';
          logLine.style.transform = 'translateY(0)';
        });

        if (progressBar) progressBar.style.width = item.progress + '%';

        currentStep++;
        setTimeout(nextLog, 450);
      } else {
        // Final delay before redirecting
        setTimeout(() => {
          window.location.href = url;
        }, 350);
      }
    }

    nextLog();
  };

  function escapeHtmlServer(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
