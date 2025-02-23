// minivue的出口文件
export * from '@my-vue/runtime-dom'

//compiler-core
import { baseCompile } from '@my-vue/compiler-core'
import * as runtimeDom from '@my-vue/runtime-core'
import { registerRuntimeCompiler } from '@my-vue/runtime-dom'
function compileToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(runtimeDom)
  return render
}

registerRuntimeCompiler(compileToFunction)
