import { createVNode } from './vnode'

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 1.先转化为vNode
        //component => vNode
        // 之后所有的逻辑操作都会基于vNode进行
        const vnode = createVNode(rootComponent)
        // render处理虚拟节点
        render(vnode, rootContainer)
      },
    }
  }
}
