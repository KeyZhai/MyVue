import { ref, h } from '../../dist/minivue.esm.js'

// 1.左侧对比
// (a b) c
// (a b) d e
// const nextChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "e" }, "E"),
// ]
// const preChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ]

// 2.右侧对比
// a （b c)
// d e (b c)
// const nextChildren = [
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "e" }, "E"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ]
// const preChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ]

// 3.新的比老的长
// (a b)
// (a b) c
// const nextChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ]
// const preChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
// ]

// 4.新的比老的长
// (a b)
// c (a b) 
// const nextChildren = [
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
// ]
// const preChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
// ]

//5.对比中间的部分
//5.1删除老的
// const preChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C", id: "c-prev" }, "C"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "F" }, "F"),
//   h("div", { key: "G" }, "G"),
// ]
// const nextChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "C", id: "c-next" }, "C"),
//   h("div", { key: "F" }, "F"),
//   h("div", { key: "G" }, "G"),
// ]

//2.移动
// const preChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "F" }, "F"),
//   h("div", { key: "G" }, "G"),
// ]
// const nextChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "F" }, "F"),
//   h("div", { key: "G" }, "G"),
// ]

//2.1 移动+创建新的节点
const preChildren = [
  h("div", { key: "A" }, "A"),
  h("div", { key: "B" }, "B"),
  h("div", { key: "C" }, "C"),
  h("div", { key: "D" }, "D"),
  h("div", { key: "E" }, "E"),
  h("div", { key: "Z" }, "Z"),
  h("div", { key: "F" }, "F"),
  h("div", { key: "G" }, "G"),
]
const nextChildren = [
  h("div", { key: "A" }, "A"),
  h("div", { key: "B" }, "B"),
  h("div", { key: "D" }, "D"),
  h("div", { key: "C" }, "C"),
  h("div", { key: "Y" }, "Y"),
  h("div", { key: "E" }, "E"),
  h("div", { key: "F" }, "F"),
  h("div", { key: "G" }, "G"),
]

// fix
// const preChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", {}, "C"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "D" }, "D"),
// ]
// const nextChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", {}, "C"),
//   h("div", { key: "D" }, "D"),
// ]


export default {
  name: 'ArrayToArray',
  setup () {
    const isChange = ref(false)
    window.isChange = isChange
    return {
      isChange
    }
  },
  render () {
    const self = this
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, preChildren)
  }
}
