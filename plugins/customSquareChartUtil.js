/*
const allItems = [
    {
        name: 'Unlocked',
        value: 10,
        color: '#3f4456',
        child: {
            name: 'Active Bonded',
            value: 400,
            color: '#2d99fe',
            child: {
                name: 'Standby Bonded',
                value: 2,
                color: '#5e2bbc',
                child: {
                    name: 'Pooled',
                    value: 3,
                    color: '#f8c950',
                }
            }
        }
    },
    {
        name: 'Unreleased supply',
        value: 40,
        color: '#4346d3',
    },
    {
        name: 'Reserve',
        value: 70,
        color: '#19ceb8',
    },
];
*/
const getTotalValue = (items) => {
    let accumulator = 0;
    items.forEach(item => {
       let childValue = 0;
       if (item.child) {
        childValue = getTotalValue([item.child]);
       }
       accumulator = accumulator + childValue + item.value;
    });
    return accumulator;
}

const calcItemProportions = (item, totalValue) => {
    let childrenValue = 0;
    let child;
    if (item.child) {
        childrenValue = getTotalValue([item.child]);
        child = calcItemProportions(item.child, totalValue);
    }
    const itemPercent = item.value / totalValue;
    const childrenPercent = childrenValue / totalValue;
    const childrenRelativePercent = childrenValue / (childrenValue + item.value)
    const itemPlusChildrenPercent = (item.value + childrenValue) / totalValue;
    const ret = {
        ...item,
        child,
        calcs: {
            itemPercent,
            childrenValue,
            childrenPercent,
            itemPlusChildrenPercent,
            childrenRelativePercent,
        },
    };
    return ret;
};

const calcChildProportions = (parent, parentArea) => {
    if (!parent.child) {
        return undefined;
    }
    const childArea = parentArea * parent.calcs.childrenRelativePercent;
    const x = childArea ? Math.sqrt(childArea) : childArea;
    const ret = { childArea, width: x, height: x };
    if (parent.child.child) {
        ret.childProportions = calcChildProportions(parent.child, childArea);
    }
    return ret;
};

// TODO: move this method to be used by Vue components to draw the squares
function main(width, height) {
    const totalValue = getTotalValue(allItems);
    const itemsWithProportions = allItems.map(i => (
        calcItemProportions(i, totalValue)
    ));
    // first calculate each columns size as groups
    // all root columns are 100% height
    return itemsWithProportions.map(i => {
        const itemWidth = (i.calcs.itemPlusChildrenPercent / 100) * width;
        const itemHeight = height;
        const itemArea = itemWidth * itemHeight;
        const childProportions = calcChildProportions(i, itemArea);
        return {
            itemWidth, itemHeight, itemArea, childProportions
        }
    });
}
