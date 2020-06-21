import './a.css'
import './a.less'
import $ from 'jquery'
import logo from './logo.jpg'
console.log($)
console.log(window.$)
const image = new Image()
image.src = logo
document.body.appendChild(image)
const heiheihei = () => {
    console.log('hahaha')
}
// heiheihei()
const fff = 'ffff'
console.log(fff);


(function() {
    return () => {
        console.log('cck')
    }
})()();

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

console.log('aaa'.includes('aa'));

[1, 2, 3,4].flat(2);

async function testasync() {
    await 1
    console.log('is testasync')
}
testasync()
console.log(gen().next())
console.log('张三丰')