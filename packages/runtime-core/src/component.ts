import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";
import { shallowReadonly, proxyRefs } from "@my-vue/reactivity";
import { emit } from "./componentEmit";

export function  createComponentInstance(vnode, parent) {
  // component 组件实例
  const component = {
    vnode,
    type: vnode.type,
    // setupState 用于存储setup返回的数据
    setupState: {},
    // proxy 代理 也具有setup返回的数据
    proxy: null,
    render: null,
    // 储存更新后的vnode，用于组件更新
    next: null,
    // 用来保存presubtree
    subTree: {},
    slots: {},
    parent,
    props: {},
    // 爷孙通信
    provides: parent ? parent.provides : {},
    isMounted: false,
    emit: () => {},
  };
  // onAdd作为props传递给Foo组件
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance) {
  /*
    vnode:{
      type:Foo,
      props:{
        count:1
      }
    }
    instance: {
     vnode:vnode,
     type:Foo,
    }
  */
  //父传子props
  initProps(instance, instance.vnode.props); //instance.props = instance.vnode.props
  //slots父传子children
  initSlots(instance, instance.vnode.children);
  // setupStatefulComponent 初始化有状态的component
  setupStatefulComponent(instance);
}

//执行执行的setup
//挂载props
function setupStatefulComponent(instance) {
  //instance.type === vnode.type
  const Component = instance.type;
  //对整个instance做代理proxy
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);

  const { setup } = Component;
  if (setup) {
    setCurrentInstance(instance); //currentInstance = instance
    //Function Object
    // 执行Foo中的setup函数，将props和emit传进去
    //如果返回的是一个对象，会把对象注入到组件上下文中
    const setupResult = setup(shallowReadonly(instance.props), {
      // 把emit挂载到foo的实例上
      emit: instance.emit,
    });
    currentInstance = null;
    // console.log(setupResult)
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  // setupResult 可能是对象，也可能是函数
  // 如果是对象，直接合并到组件实例的setupState上
  if (typeof setupResult == "object") {
    // setupState是包含着数据的对象
    // 如果是ref对象，用proxyRefs包裹可以最直接获取.value
    instance.setupState = proxyRefs(setupResult);
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const Component = instance.type;
  if (compiler && !Component.render) {
    if (Component.template) {
      Component.render = compiler(Component.template);
    }
  }
  //template
  if (Component.render) {
    instance.render = Component.render;
  }
}

let currentInstance = null;
export function getCurrentInstance() {
  return currentInstance;
}
export function setCurrentInstance(instance) {
  currentInstance = instance;
}

let compiler;
export function registerRuntimeCompiler(_compiler) {
  compiler = _compiler;
}
