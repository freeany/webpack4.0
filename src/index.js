import './a.css'
import './a.less'
// import 'bootstrap'
// import Vue from 'vue'
// import $ from 'jquery'
import logo from './logo.jpg'
// import moment from 'moment'
// import 'moment/locale/zh-cn'
// moment.locale('zh-cn')
// console.log(moment().endOf('day').fromNow())
import React from 'react'
import { render } from 'react-dom'
render(<h1>jsx</h1>, window.root)
// console.log($)
// console.log(window.$)
const image = new Image()
image.src = logo
document.body.appendChild(image)
const heiheihei = () => {
    console.log('hahaha')
}
console.log(DEV)
// heiheihei()
const fff = 'ffff'
console.log(fff);


(function() {
    return () => {
        console.log('cck')
    }
})()();

class Q {
    constructor() {
        console.lg('aaa')
    }
}
new Q()
// @log
// class A {
//      a= 1
// }
// console.log(new A().a)

function log(target) {
    console.log(target, 'is 装饰者')
}
class B {
    b = 1
}
console.log(new B().b)

function *gen() {
    yield 'asdads'
}

console.log('aaaaaaaaa'.includes('aa'));

[1, 2, 3,4].flat(2);

async function testasync() {
    await 1
    console.log('is testasync')
}
testasync()
console.log(gen().next())
console.log('张三丰')