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


//父组件在调用createComponentInstance的时候会把instance传给emit，这样emit可以访问到整个组件实例包括props
//子组件在初始化组件实例的时候会注入props -> onSayHello
//在调用子组件的setup时，传入instance.emit
//调用emitEvent的时候，会在props中找是否有on对应的event，有的话就调用并传参 