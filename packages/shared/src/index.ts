export * from './toDisplayString'

export const extend = Object.assign

export const EMPTY_OBJ = {}

export const isObject = (value) => {
  return value !== null && typeof value === 'object'
}

export const isString = (val) => typeof val === 'string'

export const hasChanged = (value, oldValue) => {
  return value !== oldValue
}
export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key)

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ''
  })
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toHandlerKey = (str: string) => {
  // 进行判断，如果str存在，那么返回on + 首字母大写的str
  return str ? 'on' + capitalize(str) : ''
}

export * from './shapeFlags'