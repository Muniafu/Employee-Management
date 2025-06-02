class APIFeatures {
  /**
   * @param {mongoose.Query} query - Mongoose query object
   * @param {Object} queryString - Request query parameters
   * @param {Object} [config] - Configuration options
   * @param {number} [config.maxLimit=100] - Maximum results per page
   * @param {number} [config.defaultLimit=20] - Default results per page
   * @param {string} [config.defaultSort='-createdAt'] - Default sort field
   */
  constructor(query, queryString, config = {}) {
    this.query = query;
    this.queryString = { ...queryString };
    this.config = {
      maxLimit: 100,
      defaultLimit: 20,
      defaultSort: '-createdAt',
      ...config
    };
    this.pagination = null;
    this.filtered = false;
  }

  /**
   * Apply advanced filtering with security enhancements
   * @returns {APIFeatures}
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);

    // 1. Basic filtering
    let queryStr = JSON.stringify(queryObj);
    
    // 2. Advanced filtering operators
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in|nin|eq|ne)\b/g, 
      match => `$${match}`
    );
    
    // 3. Parse with protection against prototype pollution
    const parsedQuery = JSON.parse(queryStr, (key, value) => {
      if (key === '__proto__' || key === 'constructor') {
        return undefined;
      }
      return value;
    });
    
    this.query = this.query.find(parsedQuery);
    this.filtered = true;
    
    return this;
  }

  /**
   * Full-text search across specified fields
   * @param {string[]} searchFields - Fields to search
   * @returns {APIFeatures}
   */
  search(searchFields = []) {
    if (this.queryString.search && searchFields.length > 0) {
      const searchText = this.queryString.search;
      
      // Build $or condition for search fields
      const searchConditions = searchFields.map(field => ({
        [field]: { $regex: searchText, $options: 'i' }
      }));
      
      if (this.filtered) {
        this.query = this.query.or(searchConditions);
      } else {
        this.query = this.query.find({ $or: searchConditions });
        this.filtered = true;
      }
    }
    return this;
  }

  /**
   * Apply sorting with field validation
   * @returns {APIFeatures}
   */
  sort() {
    if (this.queryString.sort) {
      const sortFields = this.queryString.sort.split(',');
      
      // Validate sort fields to prevent NoSQL injection
      const validSortFields = sortFields.filter(field => {
        const cleanField = field.replace(/^-/, '');
        return this.query.model.schema.path(cleanField);
      });
      
      if (validSortFields.length > 0) {
        this.query = this.query.sort(validSortFields.join(' '));
      } else {
        this.query = this.query.sort(this.config.defaultSort);
      }
    } else {
      this.query = this.query.sort(this.config.defaultSort);
    }
    return this;
  }

  /**
   * Apply field projection with security
   * @returns {APIFeatures}
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',')
        .filter(field => {
          // Prevent selecting protected fields
          const protectedFields = ['password', '__v', 'passwordResetToken'];
          return !protectedFields.includes(field);
        })
        .join(' ');
      
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * Apply pagination with limits
   * @returns {APIFeatures}
   */
  paginate() {
    const page = Math.abs(parseInt(this.queryString.page, 10)) || 1;
    let limit = Math.abs(parseInt(this.queryString.limit, 10)) || this.config.defaultLimit;
    
    // Enforce maximum limit
    limit = Math.min(limit, this.config.maxLimit);
    
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit, skip };
    
    return this;
  }

  /**
   * Get pagination metadata
   * @param {number} totalDocs - Total matching documents
   * @returns {Object} Pagination metadata
   */
  getPaginationMeta(totalDocs) {
    if (!this.pagination) return null;
    
    const { page, limit } = this.pagination;
    const totalPages = Math.ceil(totalDocs / limit);
    
    return {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: totalDocs,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    };
  }

  /**
   * Generate pagination URLs
   * @param {Object} req - Express request object
   * @returns {Object} Pagination URLs
   */
  getPaginationUrls(req, totalPages) {
    if (!this.pagination || !req) return {};
    
    const { page } = this.pagination;
    const baseUrl = this.constructor.getBaseUrl(req);
    
    const urls = {
      current: this.constructor.generatePageUrl(baseUrl, req.query, page),
      first: this.constructor.generatePageUrl(baseUrl, req.query, 1),
      last: this.constructor.generatePageUrl(baseUrl, req.query, totalPages)
    };
    
    if (page < totalPages) {
      urls.next = this.constructor.generatePageUrl(baseUrl, req.query, page + 1);
    }
    
    if (page > 1) {
      urls.prev = this.constructor.generatePageUrl(baseUrl, req.query, page - 1);
    }
    
    return urls;
  }

  /**
   * Generate URL for specific page
   * @param {string} baseUrl - Base URL
   * @param {Object} query - Original query parameters
   * @param {number} page - Page number
   * @returns {string} URL
   */
  static generatePageUrl(baseUrl, query, page) {
    const queryCopy = { ...query, page };
    const queryString = Object.entries(queryCopy)
      .filter(([key, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `${baseUrl}?${queryString}`;
  }

  /**
   * Get base URL from request
   * @param {Object} req - Express request object
   * @returns {string} Base URL
   */
  static getBaseUrl(req) {
    return `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  }
}

module.exports = APIFeatures;