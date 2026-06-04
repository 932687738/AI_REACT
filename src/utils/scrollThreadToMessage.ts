/** 在指定滚动容器内将目标消息滚到可视区域中部 */
export function scrollThreadToMessage(
  container: HTMLElement,
  target: HTMLElement,
  behavior: ScrollBehavior = 'smooth',
): void {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const nextTop =
    container.scrollTop +
    (targetRect.top - containerRect.top) -
    (container.clientHeight - targetRect.height) / 2;

  container.scrollTo({
    top: Math.max(0, nextTop),
    behavior,
  });
}
