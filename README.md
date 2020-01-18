
# [link-query](https://www.npmjs.com/package/link-query)  &middot; [![npm version](https://img.shields.io/npm/v/link-query.svg?style=flat)](https://www.npmjs.com/package/link-query)  
  
  
## 什么是 link-query?  
  
一个易于使用且高效的连表查询方法，仅有2个Api，无侵入式修改，特别为初中级前端和初级后端使用，支持一对一，一对多，嵌套查询等业务中最常用的连表操作，可以极大程度的提高代码的可维护性和工作效率，使用形式上更像面向数据库的[GraphQL ](https://graphql.org/)  
  
## 目录  
  
<!-- vim-markdown-toc GFM -->  
 * [数据库驱动支持](#数据库驱动支持)  
 * [快速预览](#快速预览)  
 * [Install](#Install)   
 * [Query](#Query)   
 * [功能说明](#功能说明)  
	 * [decorator](#decorator)
		 * Collection
		 * linkConfig
			 * [virtualFieldName]
			 * type
				 * one
				 * many
			 * foreignField
			 * localField
			 * Collection
	 * [addLinker](#addlinker)
		 * linkConfig
	 * [linkQuery](#linkquery)  
		 * $filters
		 * $options
		 * [projections]
		 * [virtualFieldName]
			 * $filters
			 * $options
			 * [projections]
 * [开发计划](#开发计划)  
	 * [addReducer](#addreducer)  
  
   
<!-- vim-markdown-toc -->  
  
## 数据库驱动支持  
 * [mongodb](https://www.npmjs.com/package/mongodb)  
 * [mongoose](https://www.npmjs.com/package/mongoose)  
  
  
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
  
## 功能说明  
  
### decorator 
 增强原始collection，为其添加[addLinker](#addLinker)  
```js  
const { decorator } = require('link-query');  
const CollectionEnhance = const decorator(Collection, linkConfig);  
```  

 * **Collection** mongodb collection或者 mongoose model   
 * **linkConfig**   
	* **[virtualFieldName]** 虚拟的字段名字  
	 * **type** [default=one]  
	 * **one** 一对一关系  
	 * **many** 一对多关系  
	 * **foreignField** *[default=_id]* 对应的传入的collection的字段，*支持深层属性，例如"user._id"*
	 * **localField** *[default=_id]* 对应添加虚拟字段的collection的字段 ，*支持深层属性，例如"user.blog._id"*
	 * **Collection** 原始Collection或者增强后的Collection，*如果是增强后的collection，可以实现嵌套查询*  
    
### addLinker
添加关联关系
```js
CollectionEnhance.addLinker(linkConfig)
```

 * linkConfig 同decorator(Collection, linkConfig)的linkConfig
 * 可以先增强后添加，使得属性可以嵌套查询
 
  *示例：*
```js
const UserEnhance = const decorator(User);
const BlogEnhance = const decorator(Blog);

UserEnhance.addLinker({
  blog: {
    collection: BlogEnhance,
    type: 'many',
    foreignField: 'userId'
  }
})
BlogEnhance.addLinker({
  user: {
    collection: UserEnhance,
      type: 'one',
      localField: 'userId'
  }
})

// 使用
UserEnhance.linkQuery({
  name: 1,
  blog: {
  title: 1,
  user: {
    name: 1,
    address: 1,
    blog: {
      ... // 继续嵌套
      }
    }
  }
}).fetch()
```
  
### LinkQuery
使用关联关系进行查询
```js
const handle = UserEnhance.linkQuery({
  $filters:{},
  $options:{},
  [projections]: 1,
  [virtualFieldName]: {
    $filters:{},
    $options:{},
    [projections]: 1
  }
})

await handle.fetch(); // 获取全部
await handle.fetchOne(); // 获取第一个
```

 * **$filters** Collection 的查询条件[query](https://docs.mongodb.com/manual/reference/method/cursor.sort/#examples)，适用于当前调用的Collection，不支持在父级直接筛选子集的属性，~~例如{ [virtualFieldName.age] : 18 }~~
 * **$options** 
	 * [sort](https://docs.mongodb.com/manual/reference/method/cursor.sort/#cursor.sort) 排序
	 * [skip](https://docs.mongodb.com/manual/reference/method/cursor.skip/#pagination-example) 跳过
	 * [limit](https://docs.mongodb.com/manual/reference/method/cursor.limit/#definition) 限制大小
 * **projections** 选取当前Collection需要的字段
 * **virtualFieldName** 定义在当前Collection的虚拟字段
	 * $filters 同上，作用于被关联表
	 * $options 同上，作用于被关联表
	 * projections 同上，作用于被关联表

*示例：*
```js
// 使用 
UserEnhance.linkQuery({
  $filters: {
    name: "Moyye"
  },
  $options:{
    limit: 1,
      sort: {
        createdAt: -1
      },
  },
  name: 1,
  blog: {
    title: 1,
    user: {
      name: 1,
      address: 1,
      blog: {
        ... // 继续嵌套
      }
  }
}}).fetch()
```

## 开发计划
### addReducer
