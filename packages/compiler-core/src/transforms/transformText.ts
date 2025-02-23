import { NodeTypes } from '../ast'
import { isText } from '../utils'

export function transformText(node) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const children = node.children
      let currentContainer
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isText(child)) {
          //如果是文本节点，继续寻找下一个
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]
            if (isText(next)) {
              //如果下一个节点也是文本节点，收集到currentContainer中
              //初始化currentContainer
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child],
                }
              }

              currentContainer.children.push(' + ')
              currentContainer.children.push(next)
              children.splice(j, 1)
              j--
            } else {
              //如果下一个节点不是文本节点，重置currentContainer
              currentContainer = undefined
              break
            }
          }
        }
      }
    }
  }
}
