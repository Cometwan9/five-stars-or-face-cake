import { defineConfig, devices } from '@playwright/test';

const localhostProxyBypass = '127.0.0.1,localhost';
const nodeProcess = (
  globalThis as typeof globalThis & {
    process: { env: Record<string, string | undefined> };
  }
).process;

nodeProcess.env.NO_PROXY = nodeProcess.env.NO_PROXY
  ? `${nodeProcess.env.NO_PROXY},${localhostProxyBypass}`
  : localhostProxyBypass;
nodeProcess.env.no_proxy = nodeProcess.env.no_proxy
  ? `${nodeProcess.env.no_proxy},${localhostProxyBypass}`
  : localhostProxyBypass;

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run dev -- --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true
  },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
