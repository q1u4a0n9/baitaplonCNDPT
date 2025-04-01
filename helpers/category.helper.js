const buildCategoryTree = (categories, parentId = "") => {
  // Tạo một mảng để lưu các danh mục con
  const tree = [];

  // Lặp qua từng danh mục trong mảng
  categories.forEach(item => {
    if(item.parent === parentId) {
      const children = buildCategoryTree(categories, item.id);

      tree.push({
        id: item.id,
        name: item.name,
        slug: item.slug,
        children: children
      });
    }
  })

  return tree;
}

module.exports.buildCategoryTree = buildCategoryTree;