const Product = require('../models/product');
const { getEsClient } = require('../config/elasticsearch');

const PRODUCT_INDEX = process.env.ELASTICSEARCH_PRODUCT_INDEX || 'products';

const getProductsService = async (page = 1, limit = 10, category = '') => {
    try {
        const skip = (page - 1) * limit;
        
        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return {
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts: total,
                hasMore,
                limit: parseInt(limit)
            }
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return null;
    }
}

const createProductService = async (productData) => {
    try {
        const product = await Product.create(productData);
        return product;
    } catch (error) {
        console.error('Error creating product:', error);
        return null;
    }
}

const getCategoriesService = async () => {
    try {
        const categories = await Product.distinct('category');
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return null;
    }
}

module.exports = {
    getProductsService,
    createProductService,
    getCategoriesService
};

const mapFiltersToEsQuery = ({ category, priceMin, priceMax, promotionMin, promotionMax, viewsMin, viewsMax, inStock }) => {
    const filters = [];
    if (category && category !== 'all') filters.push({ term: { category } });
    if (typeof inStock !== 'undefined') filters.push({ term: { inStock: inStock === 'true' || inStock === true } });
    if (priceMin || priceMax) {
        const range = {};
        if (priceMin) range.gte = Number(priceMin);
        if (priceMax) range.lte = Number(priceMax);
        filters.push({ range: { price: range } });
    }
    if (promotionMin || promotionMax) {
        const range = {};
        if (promotionMin) range.gte = Number(promotionMin);
        if (promotionMax) range.lte = Number(promotionMax);
        filters.push({ range: { promotion: range } });
    }
    if (viewsMin || viewsMax) {
        const range = {};
        if (viewsMin) range.gte = Number(viewsMin);
        if (viewsMax) range.lte = Number(viewsMax);
        filters.push({ range: { views: range } });
    }
    return filters;
};

const buildEsQuery = ({ q, ...filters }) => {
    const should = [];
    const filter = mapFiltersToEsQuery(filters);

    const text = (q || '').trim();
    if (text) {
        should.push({
            multi_match: {
                query: text,
                fields: ['name^3', 'description'],
                type: 'best_fields',
                fuzziness: 'AUTO'
            }
        });
        if (text.length <= 2) {
            should.push({ match_phrase_prefix: { name: text } });
        }
        should.push({ wildcard: { 'name.keyword': { value: `*${text}*`, case_insensitive: true } } });
    }

    if (should.length === 0 && filter.length === 0) {
        return { match_all: {} };
    }
    return {
        bool: {
            should: should.length ? should : undefined,
            minimum_should_match: should.length ? 1 : undefined,
            filter: filter.length ? filter : undefined
        }
    };
};

const searchProductsService = async (params = {}) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        ...rest
    } = params;

    const from = (Number(page) - 1) * Number(limit);

    const filtersSummary = (() => {
        const parts = [];
        if (rest.category && rest.category !== 'all') parts.push(`cat=${rest.category}`);
        if (typeof rest.inStock !== 'undefined') parts.push(`inStock=${rest.inStock}`);
        if (rest.priceMin !== undefined || rest.priceMax !== undefined) parts.push(`price=[${rest.priceMin ?? '-'},${rest.priceMax ?? '-'}]`);
        if (rest.promotionMin !== undefined || rest.promotionMax !== undefined) parts.push(`promo=[${rest.promotionMin ?? '-'},${rest.promotionMax ?? '-'}]`);
        if (rest.viewsMin !== undefined || rest.viewsMax !== undefined) parts.push(`views=[${rest.viewsMin ?? '-'},${rest.viewsMax ?? '-'}]`);
        return parts.join(' ');
    })();

    const es = getEsClient();
    if (es) {
        try {
            console.log(`[Search] Engine=ES q=${rest.q || ''} ${filtersSummary ? '| ' + filtersSummary : ''} | sort=${sortBy}:${sortOrder} | page=${page} limit=${limit}`);
            const result = await es.search({
                index: PRODUCT_INDEX,
                from,
                size: Number(limit),
                query: buildEsQuery(rest),
                sort: [ { [sortBy]: { order: sortOrder } } ]
            });
            const hits = result.hits?.hits || [];
            const products = hits.map(h => ({ id: h._id, _score: h._score, ...h._source }));
            const total = typeof result.hits?.total === 'number' ? result.hits.total : (result.hits?.total?.value || 0);
            const totalPages = Math.ceil(total / Number(limit));
            console.log(`[Search] ES result count=${products.length} total=${total}`);
            return {
                products,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalProducts: total,
                    hasMore: Number(page) < totalPages,
                    limit: Number(limit)
                }
            };
        } catch (e) {
            console.error('Elasticsearch search failed, falling back to MongoDB:', e?.message || e);
            // fallthrough to Mongo fallback
        }
    }

    // MongoDB Fallback (regex fuzzy-ish + filters)
    const mongoQuery = {};
    if (rest.category && rest.category !== 'all') mongoQuery.category = rest.category;
    if (typeof rest.inStock !== 'undefined') mongoQuery.inStock = rest.inStock === 'true' || rest.inStock === true;
    if (rest.q) {
        const regex = new RegExp(rest.q, 'i');
        mongoQuery.$or = [
            { name: regex },
            { description: regex },
            { category: regex },
            { tags: { $in: [regex] } }
        ];
    }
    if (rest.priceMin || rest.priceMax) {
        mongoQuery.price = {};
        if (rest.priceMin) mongoQuery.price.$gte = Number(rest.priceMin);
        if (rest.priceMax) mongoQuery.price.$lte = Number(rest.priceMax);
    }
    if (rest.promotionMin || rest.promotionMax) {
        mongoQuery.promotion = {};
        if (rest.promotionMin) mongoQuery.promotion.$gte = Number(rest.promotionMin);
        if (rest.promotionMax) mongoQuery.promotion.$lte = Number(rest.promotionMax);
    }
    if (rest.viewsMin || rest.viewsMax) {
        mongoQuery.views = {};
        if (rest.viewsMin) mongoQuery.views.$gte = Number(rest.viewsMin);
        if (rest.viewsMax) mongoQuery.views.$lte = Number(rest.viewsMax);
    }

        console.log(`[Search] Engine=MONGO q=${rest.q || ''} ${filtersSummary ? '| ' + filtersSummary : ''} | sort=${sortBy}:${sortOrder} | page=${page} limit=${limit} | query=${JSON.stringify(mongoQuery)}`);
        const products = await Product.find(mongoQuery)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(from)
        .limit(Number(limit));
        const total = await Product.countDocuments(mongoQuery);
        console.log(`[Search] Mongo result count=${products.length} total=${total}`);
    const totalPages = Math.ceil(total / Number(limit));
    return {
        products,
        pagination: {
            currentPage: Number(page),
            totalPages,
            totalProducts: total,
            hasMore: Number(page) < totalPages,
            limit: Number(limit)
        }
    };
};

module.exports.searchProductsService = searchProductsService;

// Helper to index a product into Elasticsearch (called after create)
const indexProductToEs = async (product) => {
    const es = getEsClient();
    if (!es) return; // silently skip if ES disabled
    try {
        await es.index({
            index: PRODUCT_INDEX,
            id: product._id.toString(),
            document: {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                image: product.image,
                inStock: product.inStock,
                views: product.views || 0,
                promotion: product.promotion || 0,
                tags: product.tags || [],
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            },
            refresh: 'wait_for'
        });
    } catch (e) {
        console.error('Index product to ES failed:', e?.message || e);
    }
};

module.exports.indexProductToEs = indexProductToEs;

// Ensure index exists with mappings
const ensureProductIndex = async () => {
    const es = getEsClient();
    if (!es) return;
    try {
        const exists = await es.indices.exists({ index: PRODUCT_INDEX });
        if (!exists) {
            await es.indices.create({
                index: PRODUCT_INDEX,
                settings: { number_of_shards: 1, number_of_replicas: 0 },
                mappings: {
                    properties: {
                        name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                        description: { type: 'text' },
                        price: { type: 'double' },
                        category: { type: 'keyword' },
                        image: { type: 'keyword' },
                        inStock: { type: 'boolean' },
                        views: { type: 'long' },
                        promotion: { type: 'integer' },
                        tags: { type: 'keyword' },
                        createdAt: { type: 'date' },
                        updatedAt: { type: 'date' }
                    }
                }
            });
            console.log(`[Search] Created index '${PRODUCT_INDEX}' with default mappings`);
        }
    } catch (e) {
        console.error('[Search] ensureProductIndex error:', e?.message || e);
    }
};

module.exports.ensureProductIndex = ensureProductIndex;

// Reindex all Mongo products into ES (bulk)
const reindexAllProducts = async () => {
    const es = getEsClient();
    if (!es) return;
    const products = await Product.find({});
    if (!products.length) return;
    const operations = [];
    for (const p of products) {
        operations.push({ index: { _index: PRODUCT_INDEX, _id: p._id.toString() } });
        operations.push({
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            image: p.image,
            inStock: p.inStock,
            views: p.views || 0,
            promotion: p.promotion || 0,
            tags: p.tags || [],
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        });
    }
    try {
        await es.bulk({ refresh: true, operations });
        console.log(`[Search] Reindexed ${products.length} products into '${PRODUCT_INDEX}'`);
    } catch (e) {
        console.error('[Search] bulk reindex error:', e?.message || e);
    }
};

module.exports.reindexAllProducts = reindexAllProducts;

// Ensure index exists and seed if empty
const ensureProductIndexAndReindex = async () => {
    const es = getEsClient();
    if (!es) return;
    await ensureProductIndex();
    try {
        const count = await es.count({ index: PRODUCT_INDEX });
        if ((count?.count || 0) === 0) {
            await reindexAllProducts();
        }
    } catch (e) {
        console.error('[Search] ensure index & reindex check failed:', e?.message || e);
    }
};

module.exports.ensureProductIndexAndReindex = ensureProductIndexAndReindex;