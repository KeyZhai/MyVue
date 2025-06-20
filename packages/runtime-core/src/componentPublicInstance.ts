import { hasOwn } from '@my-vue/shared'

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props, 
}

export const publicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    //setupState
    const { setupState, props } = instance
    //1.先检查setup的返回对象
    if (hasOwn(setupState, key)) {
      return setupState[key]
    }
    //2.检查props 
    else if (hasOwn(props, key)) {
      return props[key]
    }

    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  },
}
