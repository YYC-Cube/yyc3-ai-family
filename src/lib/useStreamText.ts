// ============================================================
// YYC3 AI Family — Stream Text Hook (Typewriter Effect)
// 富文本方案-03: AI流式打字机输出
// ============================================================

import { useCallback, useRef, useState } from 'react';

export function useStreamText() {
  const [renderText, setRenderText] = useState('');
  const finishRef = useRef(false);

  const startStream = useCallback(async (fullStr: string, speed = 12) => {
    finishRef.current = false;
    setRenderText('');
    let cur = '';
    for (let i = 0; i < fullStr.length; i++) {
      if (finishRef.current) break;
      cur += fullStr[i];
      setRenderText(cur);
      await new Promise(r => setTimeout(r, speed));
    }
  }, []);

  const fastFinish = useCallback((fullStr: string) => {
    finishRef.current = true;
    setRenderText(fullStr);
  }, []);

  return { renderText, startStream, fastFinish };
}
