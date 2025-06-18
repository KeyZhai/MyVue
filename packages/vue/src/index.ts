// minivue的出口文件
export * from '@my-vue/runtime-dom'

//compiler-core
import { baseCompile } from '@my-vue/compiler-core'
import * as runtimeDom from '@my-vue/runtime-core'
import { registerRuntimeCompiler } from '@my-vue/runtime-dom'
function compileToFunction(template) {
  const { code } = baseCompile(template)
  //将runtimeDom导出的Vue作为参数传入
  const render = new Function('Vue', code)(runtimeDom)
  return render
}
/*
等价于
// 创建函数工厂
const dynamicFunction = new Function(
  'Vue', // 形参名
  `const { createElementVNode: _createElementVNode, toDisplayString: _toDisplayString } = Vue;
   return function render(_ctx) {
     return _createElementVNode('div', null, _toDisplayString(_ctx.count))
   }`
);

// 传入运行时模块作为参数
const renderFactory = dynamicFunction(runtimeDom);

// 得到最终的渲染函数
const render = renderFactory;
*/
registerRuntimeCompiler(compileToFunction)
