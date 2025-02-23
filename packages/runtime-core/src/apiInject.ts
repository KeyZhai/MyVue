import { getCurrentInstance } from './component'

export function provide(key, value) {
  //存
  // key value
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent?.provides
    // 将当前组件的provides的prototype指向父组件的provides
    if (provides == parentProvides) {
      // 只初始化一次
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    provides[key] = value
  }
}

export function inject(key, defaultValue) {
  //取
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides

    if (key in parentProvides) {
      return parentProvides[key]
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue()
      } else {
        return defaultValue
      }
    }
  }
}
