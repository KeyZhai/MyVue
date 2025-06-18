import { createVNode, Fragment } from '../vnode'
export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) { 
    if (typeof slot === 'function') {
      // children中不能有数组
      //用div包裹的话，所有的children都在div中，不符合要求
      // return createVNode('div', {}, slot(props))
      return createVNode(Fragment, {}, slot(props))
    }
  }
}
