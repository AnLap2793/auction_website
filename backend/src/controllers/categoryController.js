const Category = require('../models/Category');

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories
}; 