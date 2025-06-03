class APIFeatures {
  /**
   * @param {mongoose.Query} query - Mongoose query object
   * @param {Object} queryString - Request query object
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Apply filtering to query
   * @returns {APIFeatures}
   */
  filter() {
    // 1A) Basic filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  /**
   * Apply sorting to query
   * @returns {APIFeatures}
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // Default sorting
    }

    return this;
  }

  /**
   * Apply field limiting
   * @returns {APIFeatures}
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // Exclude version field by default
    }

    return this;
  }

  /**
   * Apply pagination
   * @returns {APIFeatures}
   */
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  /**
   * Execute the query
   * @returns {Promise<Object>}
   */
  async execute() {
    return await this.query;
  }
}

export default APIFeatures;