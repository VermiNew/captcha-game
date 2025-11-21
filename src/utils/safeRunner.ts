export interface RunResult {
  outputs: string[];
  error?: string;
  timedOut?: boolean;
}

/**
 * Run user-supplied JS code inside a Web Worker with a timeout.
 * Captures console.log output.
 */
export const runUserCode = (
  code: string,
  timeoutMs: number = 2000
): Promise<RunResult> => {
  return new Promise((resolve) => {
    // Worker script: capture console.log and execute the code.
    const workerScript = `
      self.onmessage = function(e) {
        const code = e.data;
        const outputs = [];
        // Minimal console proxy
        const console = {
          log: function() {
            try {
              const args = Array.prototype.slice.call(arguments);
              outputs.push(args.map(a => {
                try { return typeof a === 'string' ? a : JSON.stringify(a); } catch { return String(a); }
              }).join(' '));
            } catch(_){}
          }
        };

        try {
          // Execute user code. Using Function inside worker is still isolated from the main thread.
          const fn = new Function('console', 'self', code);
          fn(console, self);
          // Post outputs back
          self.postMessage({ type: 'done', outputs });
        } catch (err) {
          const message = err && err.message ? err.message : String(err);
          self.postMessage({ type: 'error', error: message, outputs });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    let settled = false;
    const cleanup = () => {
      try { worker.terminate(); } catch (_) {}
      try { URL.revokeObjectURL(url); } catch (_) {}
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ outputs: [], timedOut: true, error: 'Execution timed out' });
    }, timeoutMs);

    worker.onmessage = (ev) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const data = ev.data || {};
      cleanup();
      if (data.type === 'done') {
        resolve({ outputs: Array.isArray(data.outputs) ? data.outputs : [] });
      } else if (data.type === 'error') {
        resolve({ outputs: Array.isArray(data.outputs) ? data.outputs : [], error: data.error });
      } else {
        resolve({ outputs: Array.isArray(data.outputs) ? data.outputs : [] });
      }
    };

    // Start worker
    try {
      worker.postMessage(code);
    } catch (err) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        cleanup();
        resolve({ outputs: [], error: String(err) });
      }
    }
  });
};

export default runUserCode;
