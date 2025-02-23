import { isString } from '@my-vue/shared'
import { NodeTypes } from './ast'
import {
  helperNameMap,
  To_DISPLAY_STRING,
  CREATE_ELEMENT_VNODE,
} from './runtimeHelpers'

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context

  //整体的前置引入
  getFunctionPremble(ast, context)

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const singature = args.join(', ')

  push(`function ${functionName}(${singature}){`)
  push('return ')
  const node: any = ast.codegenNode

  genNode(node, context)

  push('}')

  return {
    code: context.code,
  }
}

function createCodegenContext() {
  const context = {
    code: '',
    push(resource) {
      context.code += resource
    },
    helper(key) {
      return `_${helperNameMap[key]}`
    },
  }
  return context
}

function getFunctionPremble(ast, context) {
  const { push } = context
  const VueBinging = 'Vue'
  const aliasHelper = (s) => `${helperNameMap[s]}:_${helperNameMap[s]}`
  if (ast.helpers.length > 0) {
    push(`const {${ast.helpers.map(aliasHelper).join(', ')}} = ${VueBinging}`)
  }
  push('\n')
  push('return ')
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      //text
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      //interpolation
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      //simple expression
      genSimpleExpression(node, context)
      break
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
    default:
      break
  }
}

function genCompoundExpression(node, context) {
  const children = node.children
  const { push } = context
  for (let i = 0; i < children.length; i++) {
    const child = node.children[i]
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
}
function genElement(node, context) {
  const { push, helper } = context
  const { children, tag, props } = node
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList(genNullable([tag, props, children]), context)

  push(')')
}

function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (isString(node)) {
      push(node)
    } else {
      genNode(node, context)
    }
    if (i < nodes.length - 1) {
      push(' ,')
    }
  }
}

function genNullable(args: any) {
  return args.map((arg) => arg || 'null')
}

function genText(node, context) {
  const { push } = context
  push(`'${node.content}'`)
}

function genInterpolation(node, context) {
  const { push, helper } = context
  push(`${helper(To_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

function genSimpleExpression(node, context) {
  const { push } = context
  push(`${node.content}`)
}
