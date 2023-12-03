let index = 0
let count = 0

// 定义数据数组
const data = [
  { weight: 2, name: '第一项' },
  { weight: 1, name: '第二项' },
  { weight: 4, name: '第三项' },
  { weight: 5, name: '第四项' },
];

function getData(data) {
  if (index >= data.length) {
    index = 0;
    return getData(data);
  }

  const currentItem = data[index];
  if (count < currentItem.weight) {
    count++;
    return currentItem;
  } else {
    index++;
    count = 0;
    return getData(data);
  }
}


new Array(20).fill(1).forEach( item => {
	console.log(getData(data))
})

data.push({weight: 10, name: '第五项'})
new Array(20).fill(1).forEach( item => {
	console.log(getData(data))
})
