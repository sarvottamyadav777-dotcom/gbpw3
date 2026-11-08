/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.location.replace('/pw');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-3 border-transparent border-t-sky-400 border-r-indigo-500 animate-spin" />
        <div className="absolute inset-2 rounded-full overflow-hidden flex items-center justify-center bg-slate-900 border border-sky-500/30">
          <img
            src="https://i.ibb.co/Q3g9fGSt/1791541921524.png"
            alt="GB STUDY"
            className="w-12 h-12 object-cover rounded-full"
          />
        </div>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-white mb-2">GB STUDY</h1>
      <p className="text-slate-400 text-sm font-medium mb-6 text-center max-w-sm">
        Opening PW Batches, Lectures, Notes & DPPs Portal...
      </p>
      <div className="flex gap-3">
        <a
          href="/pw"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
        >
          Open Batches →
        </a>
        <a
          href="https://t.me/GBFreestudy"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2"
        >
          Join Telegram
        </a>
      </div>
    </div>
  );
}
