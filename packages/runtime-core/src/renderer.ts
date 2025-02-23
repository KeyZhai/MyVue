import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '@my-vue/shared'
import { Fragment, Text } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '@my-vue/reactivity'
import { EMPTY_OBJ } from '@my-vue/shared'
import { shouldUpdateComponent } from './updateComponentUtils'
import { queueJobs } from './scheduler'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options

  function render(initialVnode, container) {
    //patch
    // 初始化是没有n1，n1最后调用render时，会收集render中用到的数据的依赖，方便后续进行更新
    patch(null, initialVnode, container, null, null)
  }

  //n1:preSubTree n2:nowSubTree
  function patch(n1, n2, container, parentComponent, anchor) {
    // 去处理组件
    //判断vnode是组件还是普通标签，然后区分处理
    // console.log(vnode.type)
    // vnode =>flag
    const { type, shapeFlag } = n2
    // Fragment => 只处理children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // vnode => STATEFUL_COMPONENT
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    // 处理children
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      // n1不存在 =>挂载
      mountElement(n2, container, parentComponent, anchor)
    } else {
      // n1存在 => 更新
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log(n1)
    console.log(n2)
    // props
    // el是在初始化的时候赋值给n1的，后续更新没有触发初始化，没有el
    const el = (n2.el = n1.el)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    patchProps(el, oldProps, newProps)
    // children
    patchChidren(n1, n2, el, parentComponent, anchor)
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const preProp = oldProps[key]
        const nextProp = newProps[key]
        if (preProp !== nextProp) {
          hostPatchProp(el, key, preProp, nextProp)
        }
      }
      // oldProps !== {} 永远为真，因为当有值时为true，没值时为{}这里也是{}是两个不同的{}永远为{}
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  function patchChidren(n1, n2, container, parentComponent, anchor) {
    const preShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const c2 = n2.children
    const { shapeFlag } = n2
    //
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      //array to text && text to text
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //1.把老的chidren清空
        unmounted(c1)
      }
      //2.设置新的chidren
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      //text to array
      if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 1.清空文本
        hostSetElementText(container, '')
        //2.因为新的数组children没有mount，所以要mountChildren
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        //array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    function isSameVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key
    }

    // 左侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 右侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    //新的比老的多，需要创建
    if (i > e1 && i <= e2) {
      // 需要传入锚点anchor指定添加位置
      const nextPos = e2 + 1
      // 左侧对比
      // const anchor = nextPos > c2.length ? null : c2[nextPos].el
      // 右侧对比
      const anchor = nextPos < c2.length ? c2[nextPos].el : null
      // 如果是多个节点，循环添加
      while (i <= e2) {
        patch(null, c2[i], container, parentComponent, anchor)
        i++
      }
    }

    //老的比新的多，需要删除
    else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    }

    // 乱序的部分
    else {
      // 中间对比
      let s1 = i
      let s2 = i
      // 记录不同节点的总数量
      const toBePatched = e2 - s2 + 1
      // 记录已经patch的vnode
      let patched = 0
      //建立映射表 将事件复杂度降到O(1)，用于删除老节点
      const keyToNewIndexMap = new Map()
      // 建立映射表，建立新的和老的的映射关系，用于移动节点
      const newIndexToOldIndexMap = new Array(toBePatched)
      // 记录是否需要移动，优化算法
      let moved = false
      let maxNewIndexSoFar = 0
      // 初始化映射表
      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0
      }
      // 将新children的vnode的key设置在map中
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        // [D:2,C:3,Y:4,E:5]
        keyToNewIndexMap.set(nextChild.key, i)
      }
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        // 已经处理了的vnode >= 需要处理的vnode，剩下的一定是需要删除的，可以直接删除
        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }
        let newIndex
        if (prevChild.key !== null) {
          // newIndex是preChildren中的元素应该在nextChildren中的位置
          newIndex = keyToNewIndexMap.get(prevChild.key)
        }
        // 没有key时执行下面
        else {
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }
        if (newIndex === undefined) {
          hostRemove(prevChild.el)
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          // i不能等于0，当i等于0的时候是为建立映射关系，需要创建
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      // 最长递增子序列
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : []
      // 最长递增子序列指针 1
      let j = increasingNewIndexSequence.length - 1
      // 倒序插入，排除不稳定的元素
      for (let i = toBePatched - 1; i >= 0; i--) {
        //找到最后一个不稳定的元素
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        // 判断是否超过总长度，传入null默认加到最后面
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null
        // 创建新的
        // newIndexToOldIndexMap中的数量和toBePatched一样，是中间乱序的部分，如果为0，
        // 说明在preChildren中这个位置的元素被删除了，需要创建
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor)
        }
        // 移动
        if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  function unmounted(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      //remove
      hostRemove(el)
    }
  }

  function mountElement(vnode, container, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type))
    // 目前只处理string
    const { props, children, shapeFlag } = vnode
    // text children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    }
    // array children
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 如果是数组，数组中每个对象都是vnode => patch处理
      mountChildren(vnode.children, el, parentComponent, anchor)
    }
    for (const key in props) {
      const value = props[key]
      // 注册事件
      hostPatchProp(el, key, null, value)
    }
    hostInsert(el, container, anchor)
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor)
    })
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  function mountComponent(vnode, container, parentComponent, anchor) {
    // 创建组件实例
    const instance = (vnode.component = createComponentInstance(
      vnode,
      parentComponent
    ))
    // 初始化有状态的component
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container, anchor)
  }

  function setupRenderEffect(instance, vnode, container, anchor) {
    // 当调用render时，会触发this.count，此时将依赖收集起来，当触发count++时，
    // 触发依赖，effect传入的依赖重新执行，再次调用render生成一个全新的subTree
    // effect会返回一个runner，调用runner会重新执行fn
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          // init
          const { proxy } = instance
          // render返回的是vnode，this指向proxy，因为proxy代理了setup返回的数据，所以可以访问到this的数据
          // 获取虚拟节点tree
          // 当响应式对象发生改变，重新调用render生成新的虚拟节点树
          const subTree = (instance.subTree = instance.render.call(
            proxy,
            proxy
          ))
          // 生成新的虚拟节点树后，调用patch，会再次挂载到视图上
          // 需要拆分，判断什么时候是更新，什么时候是初始化
          patch(null, subTree, container, instance, anchor)
          vnode.el = subTree.el
          instance.isMounted = true
        } else {
          console.log('update')
          // 需要获取到之前的vnode
          const { next, vnode } = instance
          if (next) {
            next.el = vnode.el
            updateComponentPreRender(instance, next)
          }
          // 更新
          const { proxy } = instance
          const subTree = instance.render.call(proxy, proxy)
          const preSubTree = instance.subTree
          // 更新subTree
          instance.subTree = subTree
          patch(preSubTree, subTree, container, instance, anchor)
        }
      },
      {
        scheduler() {
          queueJobs(instance.update)
        },
      }
    )
  }

  return {
    createApp: createAppAPI(render),
  }
}

function updateComponentPreRender(instance, nextVnode) {
  instance.vnode = nextVnode
  instance.next = null
  instance.props = nextVnode.props
}

// 最长递增子序列算法
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
