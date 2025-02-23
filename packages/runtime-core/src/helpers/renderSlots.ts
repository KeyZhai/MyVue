import { createVNode, Fragment } from '../vnode'
export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function') {
      // children中不能有数组
      return createVNode(Fragment, {}, slot(props))
    }
  }
}
