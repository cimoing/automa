import './message-listener';

import { MessageListener } from '@/utils/message';

// Bridge sandbox automaFetch() requests to background `fetch` handler.
// In MV3/offscreen execution, workflows can run without the dashboard/newtab
// page open, so offscreen must proxy `automa-fetch` itself.
window.addEventListener('message', (event) => {
  const { data } = event;
  if (data?.type !== 'automa-fetch') return;

  const sandbox = document.getElementById('sandbox');
  if (!sandbox?.contentWindow) return;

  // Only accept requests coming from our sandbox iframe.
  if (event.source !== sandbox.contentWindow) return;

  const requestId = data?.data?.id;
  if (!requestId) return;

  const sendResponse = (payload) => {
    sandbox.contentWindow.postMessage(
      {
        type: 'fetchResponse',
        data: payload,
        id: requestId,
      },
      '*'
    );
  };

  MessageListener.sendMessage('fetch', data.data, 'background')
    .then((result) => {
      sendResponse({ isError: false, result });
    })
    .catch((error) => {
      sendResponse({
        isError: true,
        result: error?.message || String(error),
      });
    });
});
