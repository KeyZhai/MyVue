import { ShapeFlags } from '@my-vue/shared'

// 初始化组件插槽
export function initSlots(instance, children) {
  const { vnode } = instance
  // 通过 shapeFlag 判断是否为插槽类型内容
  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    // 标准化插槽对象并挂载到组件实例
    normalizeObjectSlots(children, instance.slots)
  }
}

// 规范化对象形式的插槽
function normalizeObjectSlots(children, slots) {
  // 遍历插槽对象的所有属性名
  for (const key in children) {
    const value = children[key]
    // 将插槽函数包装成带作用域参数的函数
    slots[key] = (props) => {
      // 执行原始插槽函数并规范化返回结果
      return normalizeSlotValue(value(props))
    }
  }
}

// 标准化插槽返回值：确保总是返回数组形式
// 场景：处理同时支持返回单个 VNode 和数组的情况
function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
