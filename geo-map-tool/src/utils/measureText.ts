let ctx: CanvasRenderingContext2D | null = null;

function getCtx(): CanvasRenderingContext2D {
  if (!ctx) {
    const canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
  }
  return ctx as CanvasRenderingContext2D;
}

export function measureTextWidth(text: string, fontSizePx: number, fontFamily = 'system-ui, sans-serif'): number {
  const c = getCtx();
  c.font = `${fontSizePx}px ${fontFamily}`;
  return c.measureText(text).width;
}
