const sumValues = (item) => {
  if (item.child) {
    return item.value + sumValues(item.child);
  }
  return item.value;
};
const getTotalValue = (items) => {
  let accumulator = 0;
  items.forEach((item) => {
    let childValue = 0;
    if (item.child) {
      childValue = getTotalValue([item.child]);
    }
    accumulator = accumulator + childValue + item.value;
  });
  return accumulator;
};

const calcItemWidthHeight = (
  item, totalValue, maxWidth, maxHeight, isChild,
) => {
  const availableArea = maxWidth * maxHeight; // this is equivalent to totalValue
  const relativeItemValue = sumValues(item);
  const relativeValueProportion = relativeItemValue / totalValue;

  const relativeArea = relativeValueProportion * availableArea;

  const childProps = item.child
    ? calcItemWidthHeight(item.child, totalValue, maxWidth, maxHeight, true)
    : undefined;

  if (!isChild) {
    return {
      name: item.name,
      color: item.color,
      value: item.value,
      child: childProps,
      width: relativeArea / maxHeight,
      height: maxHeight,
    };
  }

  const squareWidthOrHeight = Math.sqrt(relativeArea);
  let itemHeight = squareWidthOrHeight;
  let itemWidth = squareWidthOrHeight;
  if (squareWidthOrHeight > maxHeight) {
    const halfOverload = (squareWidthOrHeight - maxHeight) / 2;
    itemHeight = maxHeight - halfOverload;
    itemWidth = (relativeArea / itemHeight) + halfOverload;
  } else if (squareWidthOrHeight > maxWidth) {
    const halfOverload = (squareWidthOrHeight - maxWidth) / 2;
    itemWidth = maxWidth - halfOverload;
    itemHeight = (relativeArea / itemWidth) + halfOverload;
  }
  return {
    name: item.name,
    color: item.color,
    value: item.value,
    child: childProps,
    width: itemWidth,
    height: itemHeight,
  };
};

export default function getProportions(allItems, width, height) {
  const totalValue = getTotalValue(allItems);
  // const availableArea = width * height;
  const itemsWithProportions = allItems.map(i => (
    calcItemWidthHeight(i, totalValue, width, height)
  ));
  return itemsWithProportions;
}
