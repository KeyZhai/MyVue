import { ReactiveEffect } from "./effect";
import { isFunction } from "../../shared/src/index";

export function watch(source, cb) {
  let getter: () => any;
  if (isFunction(source)) {
    //将source保存到original.count的Set中
    getter = () => source();
  } else {
    getter = () => source.value;
  }

  let oldValue;
  const scheduler = () => {
    //调用getter获取最新值
    const newValue = effect.run();
    //进行逻辑处理
    cb(newValue, oldValue);
    //将oldValue更新为newValue
    oldValue = newValue;
  };

  const effect = new ReactiveEffect(getter, scheduler);

  oldValue = effect.run();
} 

