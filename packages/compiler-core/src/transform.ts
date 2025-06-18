import { NodeTypes } from './ast'
import { To_DISPLAY_STRING } from './runtimeHelpers'
import { CREATE_ELEMENT_VNODE } from './runtimeHelpers'

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      const keyString = typeof key === 'symbol' ? key.toString() : key
      context.helpers.set(key, `_${keyString}`)
    },
  }
  return context
}

export function transform(root, options = {}) {
  //创建全局对象，储存options
  const context = createTransformContext(root, options)
  //遍历ast - 深度优先
  traverseNode(root, context)
  //创建根节点的codegenNode
  createRootCodegen(root)
  //将helpers转换为数组
  root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root) {
  const child = root.children[0]
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode
  } else {
    root.codegenNode = root.children[0]
  }
}

//抽离出变动点和稳定点
function traverseNode(node, context) {
  console.log('node', node)
  const nodeTransforms = context.nodeTransforms
  const exitFns: any = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    const onExist = transform(node, context)
    if (onExist) {
      exitFns.push(onExist)
    }
  }
  console.log('exitFns', exitFns)
  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(To_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
      traverseChildren(node, context)
      break
    case NodeTypes.ELEMENT:
      traverseChildren(node, context)
      context.helper(CREATE_ELEMENT_VNODE)
      break
    default:
      break
  }
  console.log('exitFns after', exitFns)
  //反向执行，使得plugin先注册的后执行
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
  console.log('node', node)
}

function traverseChildren(node, context) {
  const children = node.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      traverseNode(node, context)
    }
  }
}
