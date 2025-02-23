import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, []))
}

function parseChildren(context, ancestors) {
  const nodes: any[] = []
  while (!isEnd(context, ancestors)) {
    let node
    // 判断是否是插值表达式
    const s = context.source
    if (s.startsWith('{{')) {
      node = parseInterpolation(context)
    }
    // 判断是否为element
    else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }
    // 判断是否为text
    else {
      node = parseText(context)
    }
    nodes.push(node)
  }
  return nodes
}

function isEnd(context, ancestors) {
  const s = context.source
  //遇到结束标签
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if (startsWithEndTagOpen(s, tag)) {
        return true
      }
    }
  }
  //source有值的时候
  return !s
}

function parseElement(context, ancestors) {
  //处理开始标签
  const element: any = parserTag(context, TagType.Start)
  // 收集ancestors
  ancestors.push(element)
  // 处理子节点
  element.children = parseChildren(context, ancestors)
  // 弹出ancestors
  ancestors.pop()
  // 处理结束标签
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parserTag(context, TagType.End)
  } else {
    throw new Error(`缺少结束标签${element.tag}`)
  }
  return element
}

function startsWithEndTagOpen(source, tag) {
  return (
    source.startsWith('</') &&
    source.slice(2, 2 + tag.length).toLowerCase() == tag.toLowerCase()
  )
}

function parserTag(context, tagType) {
  // 1.解析 tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]
  // 2.删除处理完成的代码
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if (tagType === TagType.Start) {
    return {
      type: NodeTypes.ELEMENT,
      tag: tag,
    }
  }
}

function parseText(context) {
  // 判断处理{{, <, 两者之间的内容
  let endIndex = context.source.length
  let endTokens = ['<', '{{']
  // 如果找到{{, <, 则赋值
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    //嵌套的element，找到最近的{{, <
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }
  const content = parseTextData(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content: content,
  }
}

function parseTextData(context, length) {
  const content = context.source.slice(0, length)
  advanceBy(context, length)
  return content
}

function parseInterpolation(context) {
  //{{message}}
  const openDelimiter = '{{'
  const closeDelimiter = '}}'
  //从第二个字符开始找，找到第一个closeDelimiter的位置，即第一个}}
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  )
  //切掉前两个{{
  advanceBy(context, closeDelimiter.length)
  const rawContentLength = closeIndex - closeDelimiter.length
  // 得到message
  const rawContent = parseTextData(context, rawContentLength)
  // 去掉空格
  const content = rawContent.trim()
  // 清空context.source，方便解析后面的内容
  advanceBy(context, closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  }
}

function advanceBy(context, length) {
  context.source = context.source.slice(length)
}

function createRoot(children) {
  return {
    children,
    type: NodeTypes.ROOT,
  }
}

function createParserContext(content: string) {
  return {
    source: content,
  }
}
