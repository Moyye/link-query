# [link-query](https://www.npmjs.com/package/link-query)  &middot; [![npm version](https://img.shields.io/npm/v/link-query.svg?style=flat)](https://www.npmjs.com/package/link-query)


## 什么是 link-query?

一个易于使用且高效的连表查询方法，无侵入式修改，特别为初中级前端和初级后端使用，支持一对一，一对多，嵌套查询等业务中最常用的连表操作，可以极大程度的提高代码的可维护性和工作效率，使用形式上更像面向数据库的[GraphQL ](https://graphql.org/)

## 目录

<!-- vim-markdown-toc GFM -->
* [数据库驱动支持](#数据库驱动支持)
* [快速预览](#快速预览)
    * [Install](#Install) 
    * [Query](#Query) 
* [功能说明](#功能说明)


<!-- vim-markdown-toc -->

## 数据库驱动支持
*   [mongodb](https://www.npmjs.com/package/mongodb)
*   [mongoose](https://www.npmjs.com/package/mongoose)


## 快速预览

### Install
```
npm install link-query --save
```
### Query
```js
const { decorator } = require('link-query');
const UserEnhance = decorator(User);
UserEnhance.addLinker({
  ...
})
UserEnhance.linkQuery({
  name: 1,
  address: 1,
  friends: {
    name: 1,
  },
  blog: {
    title: 1,
    author: {
      name: 1,
    },
    comments: {
      content: 1,
      createdAt: 1,
    },
    tags: {
      title: 1,
    }
  }
})
```
result:
```
[{
  name: 'people name',
  address: 'people address',
  friends: [{
    name: 'friend name'
  }],
  blog: [{
    title: 'blog title',
    author: {
      name: 'author name',
    },
    comments: [{
      content: 'comment content',
      createdAt: '2010-10-10',
    }],
    tags: [{
      title: 'tag title',
    }]
  }]
}]
```
