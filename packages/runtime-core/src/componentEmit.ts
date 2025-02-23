import { toHandlerKey, camelize } from '@my-vue/shared'
export function emit(instance, event, ...args) {
  // console.log(event) add
  // instance.props => event
  const { props } = instance

  // TPP
  // 先写一个特定的行为 => 重构成通用的行为
  //add-foo => AddFoo

  const HandelerName = toHandlerKey(camelize(event))

  const handler = props[HandelerName]
  handler && handler(...args)
}
