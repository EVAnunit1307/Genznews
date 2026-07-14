/**
 * Progressive enhancement for horizontal "slidable" pill bars (topic filters).
 *
 * Touch already scrolls these natively; this adds the pieces that make them
 * feel usable everywhere:
 *   - edge fades so it's obvious more categories exist off-screen
 *   - mouse wheel → horizontal scroll (polite: releases at the ends so the
 *     page can keep scrolling)
 *   - click-and-drag to slide with a mouse, without eating pill clicks
 *   - scrolls the active pill into view on load (e.g. landing on /fashion)
 *
 * Returns a cleanup function.
 */
export function enhanceHScroll(track: HTMLElement | null): () => void {
  if (!track) return () => {};

  const EDGE = 2; // px slack when deciding "at an edge"

  const updateAffordance = () => {
    const max = track.scrollWidth - track.clientWidth;
    const overflowing = max > EDGE;
    track.classList.toggle('is-overflowing', overflowing);
    const l = track.scrollLeft;
    track.style.setProperty('--fade-l', overflowing && l > EDGE ? '28px' : '0px');
    track.style.setProperty('--fade-r', overflowing && l < max - EDGE ? '28px' : '0px');
  };

  // Mouse wheel → horizontal, but let the page scroll once we hit an end.
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // already horizontal intent
    const max = track.scrollWidth - track.clientWidth;
    if (max <= EDGE) return; // nothing to slide
    const atStart = track.scrollLeft <= EDGE;
    const atEnd = track.scrollLeft >= max - EDGE;
    if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return; // release to page
    e.preventDefault();
    track.scrollLeft += e.deltaY;
  };

  // Click-and-drag to slide (mouse only — touch handles itself).
  let down = false;
  let startX = 0;
  let startLeft = 0;
  let moved = false;

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (track.scrollWidth - track.clientWidth <= EDGE) return;
    down = true;
    moved = false;
    startX = e.clientX;
    startLeft = track.scrollLeft;
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 4) {
      moved = true;
      track.classList.add('dragging');
    }
    if (moved) track.scrollLeft = startLeft - dx;
  };
  const endDrag = () => {
    if (!down) return;
    down = false;
    track.classList.remove('dragging');
  };
  // Swallow the click that ends a drag so it doesn't trigger the pill under it.
  const onClickCapture = (e: MouseEvent) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  };

  track.addEventListener('wheel', onWheel, { passive: false });
  track.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', endDrag);
  track.addEventListener('click', onClickCapture, true);
  track.addEventListener('scroll', updateAffordance, { passive: true });

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateAffordance) : null;
  ro?.observe(track);

  // Land on the active pill (skip if it's already the first / leftmost one).
  const active = track.querySelector<HTMLElement>(
    '[aria-current="page"], [aria-pressed="true"], [data-active="true"]',
  );
  if (active && active.offsetLeft > track.clientWidth * 0.5) {
    track.scrollTo({
      left: active.offsetLeft - (track.clientWidth - active.offsetWidth) / 2,
      behavior: 'auto',
    });
  }
  updateAffordance();

  return () => {
    track.removeEventListener('wheel', onWheel);
    track.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    track.removeEventListener('click', onClickCapture, true);
    track.removeEventListener('scroll', updateAffordance);
    ro?.disconnect();
  };
}
